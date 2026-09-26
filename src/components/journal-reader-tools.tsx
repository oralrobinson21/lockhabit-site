import { Link } from "@tanstack/react-router";
import { Bookmark, Copy, Heart, MessageCircle, Pause, Play, Share2, Square, ThumbsUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import { supabase } from "@/integrations/supabase/client";
import {
  getJournalEngagement,
  recordJournalShare,
  submitJournalComment,
  toggleJournalBookmark,
  toggleJournalReaction,
} from "@/lib/journal-community.functions";

type Engagement = Awaited<ReturnType<typeof getJournalEngagement>>;

export function JournalReaderTools({
  slug,
  title,
  text,
}: {
  slug: string;
  title: string;
  text: string;
}) {
  const [accessToken, setAccessToken] = useState("");
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [speed, setSpeed] = useState<1 | 1.5 | 2>(1);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [notice, setNotice] = useState("");
  const [comment, setComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;
  const state = engagement && "found" in engagement && engagement.found ? engagement : null;

  async function refresh(token = accessToken) {
    try {
      const next = await getJournalEngagement({
        data: { slug, ...(token ? { accessToken: token } : {}) },
      });
      setEngagement(next);
    } catch {
      setEngagement(null);
    }
  }

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const token = data.session?.access_token ?? "";
      setAccessToken(token);
      void refresh(token);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      const token = session?.access_token ?? "";
      setAccessToken(token);
      void refresh(token);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [slug]);

  function startReading() {
    if (!speechSupported || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed;
    utterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };
    utterance.onerror = () => {
      setSpeaking(false);
      setPaused(false);
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
    setPaused(false);
    setNotice("Reading the story aloud.");
  }

  function pauseOrResume() {
    if (!speechSupported || !speaking) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }

  function stopReading() {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setSpeaking(false);
    setPaused(false);
  }

  async function share(channel: "native" | "copy_link") {
    const url = window.location.href;
    try {
      if (channel === "native" && navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setNotice("Link copied.");
      }
      await recordJournalShare({
        data: { slug, channel, ...(accessToken ? { accessToken } : {}) },
      });
    } catch {
      if (channel === "copy_link") setNotice("We could not copy the link automatically.");
    }
  }

  async function react(reaction: "like" | "helpful" | "made_me_laugh") {
    if (!accessToken) {
      setNotice("Check in with a free reader account to react.");
      return;
    }
    try {
      await toggleJournalReaction({ data: { accessToken, slug, reaction } });
      await refresh();
      setNotice("Reaction saved.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Reaction could not be saved.");
    }
  }

  async function bookmark() {
    if (!accessToken) {
      setNotice("Check in with a free reader account to save stories.");
      return;
    }
    try {
      const result = await toggleJournalBookmark({ data: { accessToken, slug } });
      await refresh();
      setNotice(result.saved ? "Saved for later." : "Removed from saved stories.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Saved story could not be updated.");
    }
  }

  async function sendComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) {
      setNotice("Check in with a free reader account before commenting.");
      return;
    }
    setSendingComment(true);
    try {
      await submitJournalComment({ data: { accessToken, slug, body: comment } });
      setComment("");
      setNotice("Sent to the front desk for moderation.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Comment could not be sent.");
    } finally {
      setSendingComment(false);
    }
  }

  const reactionButtons = useMemo(
    () => [
      { id: "like" as const, label: "Like", icon: <Heart size={17} />, count: state?.counts.like ?? 0 },
      { id: "helpful" as const, label: "Helpful", icon: <ThumbsUp size={17} />, count: state?.counts.helpful ?? 0 },
      { id: "made_me_laugh" as const, label: "Made me laugh", icon: <MessageCircle size={17} />, count: state?.counts.made_me_laugh ?? 0 },
    ],
    [state],
  );

  return (
    <section className="mb-10 rounded-3xl border-2 border-foreground bg-paper p-5 shadow-[5px_5px_0_var(--color-foreground)] sm:p-6" aria-label="Story tools">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="memo text-coral">Room service for your eyeballs</p>
          <h2 className="mt-1 font-display text-2xl font-semibold">Read it your way.</h2>
        </div>
        <Link to="/journal/join" className="secondary-button bg-background">
          Free reader check-in · 10% for life
        </Link>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border-2 border-foreground bg-secondary p-4">
          <p className="memo">Read aloud</p>
          <p className="mt-2 text-sm text-muted-foreground">Normal, faster, or “I have places to be.”</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {([1, 1.5, 2] as const).map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => {
                  setSpeed(value);
                  if (speaking) {
                    stopReading();
                    setTimeout(startReading, 0);
                  }
                }}
                aria-pressed={speed === value}
                className={"rounded-full border-2 border-foreground px-3 py-2 text-sm font-bold " + (speed === value ? "bg-sun" : "bg-background")}
              >
                {value === 1 ? "1× Normal" : value + "×"}
              </button>
            ))}
            {!speaking ? (
              <button type="button" onClick={startReading} disabled={!speechSupported} className="dark-button">
                <Play size={16} /> Listen
              </button>
            ) : (
              <>
                <button type="button" onClick={pauseOrResume} className="dark-button">
                  {paused ? <Play size={16} /> : <Pause size={16} />} {paused ? "Resume" : "Pause"}
                </button>
                <button type="button" onClick={stopReading} className="secondary-button bg-background">
                  <Square size={15} /> Stop
                </button>
              </>
            )}
          </div>
          {!speechSupported ? <p className="mt-3 text-xs text-muted-foreground">Read aloud is not available in this browser.</p> : null}
        </div>

        <div className="rounded-2xl border-2 border-foreground bg-[#f5e5bd] p-4">
          <p className="memo">Pass it around</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {typeof navigator !== "undefined" && "share" in navigator ? (
              <button type="button" onClick={() => void share("native")} className="secondary-button bg-background">
                <Share2 size={16} /> Share
              </button>
            ) : null}
            <button type="button" onClick={() => void share("copy_link")} className="secondary-button bg-background">
              <Copy size={16} /> Copy link
            </button>
            <button type="button" onClick={() => void bookmark()} className="secondary-button bg-background">
              <Bookmark size={16} fill={state?.bookmarked ? "currentColor" : "none"} /> {state?.bookmarked ? "Saved" : "Save"}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {reactionButtons.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => void react(item.id)}
                aria-pressed={Boolean(state?.userReactions.includes(item.id))}
                className={"rounded-full border-2 border-foreground px-3 py-2 text-sm font-bold " + (state?.userReactions.includes(item.id) ? "bg-sun" : "bg-background")}
              >
                <span className="inline-flex items-center gap-1.5">{item.icon}{item.label} · {item.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {state?.settings.commentsEnabled && state.commentsAllowed ? (
        <div className="mt-6 border-t-2 border-foreground pt-6">
          <p className="memo text-coral">The guestbook</p>
          <h3 className="mt-1 font-display text-2xl font-semibold">Comments, with a front desk.</h3>
          <div className="mt-4 space-y-3">
            {state.comments.length ? state.comments.map((entry) => (
              <article key={entry.id} className="rounded-2xl border border-foreground/30 bg-background p-4">
                <p className="font-bold">{entry.displayName}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{entry.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString("en-US")}</p>
              </article>
            )) : <p className="text-sm text-muted-foreground">No approved comments yet. Somebody has to be first.</p>}
          </div>
          <form className="mt-5" onSubmit={sendComment}>
            <label className="block">
              <span className="memo">Add to the conversation</span>
              <textarea
                required
                maxLength={4000}
                rows={4}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className="mt-2 w-full rounded-2xl border-2 border-foreground bg-background p-4 outline-none focus:ring-4 focus:ring-sun/40"
                placeholder="Useful, funny, skeptical, curious — all welcome. Spam is not."
              />
            </label>
            <button disabled={sendingComment} className="dark-button mt-3">
              {sendingComment ? "Sending…" : "Send to the guestbook"}
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-6 border-t border-foreground/20 pt-4 text-sm text-muted-foreground">
          The guestbook infrastructure is ready, but comments are intentionally closed for now.
        </div>
      )}

      {notice ? <p role="status" className="mt-4 text-sm font-medium">{notice}</p> : null}
    </section>
  );
}
