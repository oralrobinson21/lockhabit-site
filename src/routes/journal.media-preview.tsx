import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Mail, Search, Sparkles, Sun, Waves } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import { IslandFooter } from "@/components/island-footer";
import { SiteHeader } from "@/components/site-header";
import { prototypeAuthors, prototypeStories } from "@/lib/journal-prototype-data";

export const Route = createFileRoute("/journal/media-preview")({
  head: () => ({
    meta: [
      { title: "LOCKHABIT Media Prototype" },
      { name: "robots", content: "noindex,nofollow,noarchive" },
    ],
  }),
  component: MediaPreview,
});

function MediaPreview() {
  const [query, setQuery] = useState("");
  const [poll, setPoll] = useState<"yes" | "no" | null>(null);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([
    "Drinking celery juice before sunrise. My blender still has trust issues.",
    "A 12-step nighttime routine. I mostly learned that I enjoy sleeping.",
    "Cold plunges. I remain unconvinced that suffering before coffee is character-building.",
  ]);
  const [newsletter, setNewsletter] = useState("");
  const [joined, setJoined] = useState(false);

  const hero = prototypeStories[0];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return prototypeStories;
    return prototypeStories.filter((story) =>
      [story.title, story.dek, story.category, story.franchise, story.lane].join(" ").toLowerCase().includes(q),
    );
  }, [query]);

  const trending = prototypeStories.slice(1, 6);
  const tried = prototypeStories.find((story) => story.slug === "shower-in-complete-darkness")!;

  function addAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!answer.trim()) return;
    setAnswers((current) => [answer.trim(), ...current].slice(0, 5));
    setAnswer("");
  }

  function joinNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newsletter.trim()) return;
    setJoined(true);
  }

  return (
    <main className="min-h-screen bg-[#f8f0dd] text-[#173c2d]">
      <SiteHeader />

      <div className="overflow-hidden border-b-2 border-foreground bg-sun py-2">
        <div className="flex min-w-max animate-[ticker_28s_linear_infinite] items-center gap-10 px-5 memo">
          <span>GOOD MORNING FROM THE RESORT ☀</span>
          <span>NEW: THE EVERYTHING SHOWER HAS OFFICIALLY GOTTEN OUT OF HAND</span>
          <span>87% OF GUESTS WOULD TRY THIS</span>
          <span>LATEST DISPATCH · 12 MIN AGO</span>
          <span>GOOD ADVICE · QUESTIONABLE EXPERIMENTS · BETTER SHOWERS</span>
        </div>
      </div>

      <section className="relative overflow-hidden border-b-2 border-foreground px-5 py-10 lg:px-10 lg:py-16">
        <div className="pointer-events-none absolute -right-8 top-6 rotate-12 text-[9rem] opacity-10">☀</div>
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="memo text-coral">LOCKHABIT MEDIA · THE RESORT DAILY</p>
              <h1 className="mt-2 font-slab text-[clamp(3.5rem,9vw,8rem)] uppercase leading-[.82]">
                Keep the<br /><span className="text-coral">vibes going.</span>
              </h1>
            </div>
            <div className="max-w-sm rotate-2 border-2 border-foreground bg-paper p-5 shadow-[5px_5px_0_var(--color-foreground)]">
              <p className="memo">Front desk note</p>
              <p className="mt-2 font-display text-xl">This is what happens when a soap company refuses to write a boring blog.</p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.55fr_.75fr]">
            <Link to="/journal/media-preview/$slug" params={{ slug: hero.slug }} className="group relative overflow-hidden border-2 border-foreground bg-paper shadow-[8px_8px_0_var(--color-foreground)]">
              <img src={hero.image} alt="" className="aspect-[16/9] w-full object-cover" />
              <div className="p-6 sm:p-8">
                <p className="memo text-coral">{hero.franchise}</p>
                <h2 className="mt-3 max-w-4xl font-slab text-[clamp(2.6rem,5vw,5rem)] uppercase leading-[.9] group-hover:underline">{hero.title}</h2>
                <p className="mt-5 max-w-3xl font-display text-xl leading-relaxed">{hero.dek}</p>
                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm"><span>By Maya</span><span>·</span><span>{hero.readTime} min</span><span>·</span><span>{hero.age}</span></div>
              </div>
              <span className="absolute right-5 top-5 rotate-6 bg-sun px-3 py-2 memo shadow-[3px_3px_0_var(--color-foreground)]">we have questions →</span>
            </Link>

            <div className="space-y-4">
              {prototypeStories.slice(1, 4).map((story, index) => (
                <Link key={story.slug} to="/journal/media-preview/$slug" params={{ slug: story.slug }} className={"block border-2 border-foreground p-5 transition hover:-translate-y-1 " + (index === 0 ? "bg-coral text-coral-foreground rotate-[-1deg]" : index === 1 ? "bg-secondary rotate-1" : "bg-paper rotate-[-.5deg]")}>
                  <p className="memo">{story.franchise}</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">{story.title}</h3>
                  <p className="mt-3 text-sm opacity-80">{story.age} · {story.readTime} min</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b-2 border-foreground bg-[#173c2d] px-5 py-10 text-[#f8f0dd] lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[.7fr_1.3fr]">
          <div>
            <p className="memo text-sun">WHAT'S BLOWING UP</p>
            <h2 className="mt-2 font-slab text-5xl uppercase">The lobby is talking.</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#f8f0dd]/70">Fast-rising stories, arguments, experiments, and things people keep sending us at unreasonable hours.</p>
          </div>
          <ol className="divide-y divide-[#f8f0dd]/25 border-y border-[#f8f0dd]/25">
            {trending.map((story, index) => (
              <li key={story.slug}>
                <Link to="/journal/media-preview/$slug" params={{ slug: story.slug }} className="grid grid-cols-[3rem_1fr_auto] items-center gap-4 py-4 hover:text-sun">
                  <span className="font-slab text-4xl">{index + 1}</span>
                  <span className="font-display text-xl font-semibold">{story.title}</span>
                  <span className="memo hidden text-sun sm:block">{index === 0 ? "↑ 42% today" : index === 1 ? "people keep sending us this" : story.age}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-3">
            {(["RIGHT NOW", "HELP ME", "ENTERTAIN ME"] as const).map((lane, laneIndex) => {
              const laneStories = prototypeStories.filter((story) => story.lane === lane).slice(0, 3);
              return (
                <section key={lane} className={laneIndex === 0 ? "lg:-rotate-1" : laneIndex === 2 ? "lg:rotate-1" : ""}>
                  <div className={"border-2 border-foreground p-5 " + (laneIndex === 0 ? "bg-sun" : laneIndex === 1 ? "bg-paper" : "bg-secondary")}>
                    <p className="memo">{lane}</p>
                    <p className="mt-2 text-sm">{lane === "RIGHT NOW" ? "Things changing while you were in the shower." : lane === "HELP ME" ? "Useful enough to bookmark. We won't be offended." : "Curiosity, questionable experiments, zero beige."}</p>
                  </div>
                  <div className="mt-3 space-y-3">
                    {laneStories.map((story) => (
                      <Link key={story.slug} to="/journal/media-preview/$slug" params={{ slug: story.slug }} className="block border-b-2 border-foreground py-4">
                        <p className="memo text-coral">{story.category}</p>
                        <h3 className="mt-1 font-display text-xl font-semibold leading-tight hover:underline">{story.title}</h3>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-y-2 border-foreground bg-[#bfe1dd] px-5 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_.95fr] lg:items-center">
          <div className="relative">
            <div className="absolute -left-3 -top-3 z-10 -rotate-6 bg-coral px-4 py-2 memo text-coral-foreground shadow-[4px_4px_0_var(--color-foreground)]">WE TRIED IT</div>
            <img src={tried.image} alt="" className="aspect-[4/3] w-full rotate-1 border-2 border-foreground object-cover shadow-[10px_10px_0_var(--color-foreground)]" />
          </div>
          <div>
            <p className="memo text-coral">We tried it so your bathroom didn't have to.</p>
            <h2 className="mt-3 font-slab text-[clamp(3rem,6vw,5.5rem)] uppercase leading-[.9]">{tried.title}</h2>
            <p className="mt-5 font-display text-xl">{tried.dek}</p>
            <div className="mt-7 border-2 border-foreground bg-paper p-5">
              <p className="memo">Would you try it?</p>
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={() => setPoll("yes")} className={"dark-button " + (poll === "yes" ? "ring-4 ring-sun" : "")}>TRY IT</button>
                <button type="button" onClick={() => setPoll("no")} className={"secondary-button bg-background " + (poll === "no" ? "ring-4 ring-sun" : "")}>ABSOLUTELY NOT</button>
              </div>
              <div className="mt-4 h-4 overflow-hidden rounded-full border-2 border-foreground bg-background">
                <div className="h-full bg-coral transition-all" style={{ width: poll === "no" ? "61%" : poll === "yes" ? "89%" : "83%" }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{poll === "no" ? "61% would try it · your vote has been emotionally noted." : poll === "yes" ? "89% would try it · chaos wins again." : "83% of imaginary resort guests would try it."}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="memo text-primary">FROM THE BATHHOUSE</p><h2 className="mt-2 font-slab text-5xl uppercase">Useful without the lecture.</h2></div>
            <Waves size={64} className="text-coral" aria-hidden="true" />
          </div>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {prototypeStories.filter((story) => story.franchise === "FROM THE BATHHOUSE").map((story) => (
              <Link key={story.slug} to="/journal/media-preview/$slug" params={{ slug: story.slug }} className="group border-t-4 border-foreground pt-4">
                <img src={story.image} alt="" className="aspect-[4/3] w-full border-2 border-foreground object-cover" />
                <p className="memo mt-4 text-coral">Expert-check structure ready</p>
                <h3 className="mt-2 font-display text-2xl font-semibold leading-tight group-hover:underline">{story.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y-2 border-foreground bg-paper px-5 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="memo text-coral">MEET THE PEOPLE AT THE RESORT</p>
          <h2 className="mt-2 font-slab text-5xl uppercase">Follow a person, not a logo.</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {prototypeAuthors.map((author, index) => (
              <Link key={author.slug} to="/journal/media-preview/author/$slug" params={{ slug: author.slug }} className={"group border-2 border-foreground bg-[#f8f0dd] p-4 shadow-[6px_6px_0_var(--color-foreground)] " + (index === 0 ? "rotate-[-1deg]" : index === 2 ? "rotate-1" : "")}>
                <img src={author.image} alt="" className="aspect-square w-full object-cover" />
                <p className="memo mt-4 text-coral">{author.desk}</p>
                <h3 className="mt-1 font-display text-3xl font-semibold group-hover:underline">{author.name}</h3>
                <p className="mt-2 text-sm">{author.line}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.85fr_1.15fr]">
          <div className="rotate-[-1deg] border-2 border-foreground bg-sun p-6 shadow-[8px_8px_0_var(--color-foreground)]">
            <p className="memo">ASK LOCKHABIT</p>
            <h2 className="mt-2 font-display text-3xl font-semibold">What's one wellness habit everyone swears by that did absolutely nothing for you?</h2>
            <form onSubmit={addAnswer} className="mt-5">
              <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} rows={4} className="w-full border-2 border-foreground bg-paper p-4" placeholder="Be nice. Be specific. Be funny if the universe allows it." />
              <button className="dark-button mt-3">Send it to the front desk</button>
            </form>
          </div>
          <div className="space-y-3">
            {answers.map((item, index) => <blockquote key={index} className="border-l-4 border-coral bg-paper p-5 font-display text-xl">“{item}”</blockquote>)}
          </div>
        </div>
      </section>

      <section className="border-y-2 border-foreground bg-[#173c2d] px-5 py-12 text-[#f8f0dd] lg:px-10 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <Mail className="text-sun" size={38} />
            <p className="memo mt-4 text-sun">THE MORNING SHOWER</p>
            <h2 className="mt-2 font-slab text-5xl uppercase">Five minutes of useful nonsense for a better day.</h2>
          </div>
          <div className="border-2 border-[#f8f0dd] bg-[#f8f0dd] p-6 text-[#173c2d]">
            <ul className="grid gap-2 text-sm sm:grid-cols-2">
              <li>☀ one thing worth knowing</li><li>🧼 one body/skin idea</li><li>🌿 one ingredient we're investigating</li><li>😂 one ridiculous internet thing</li><li>🏖 one thing that may improve the day</li>
            </ul>
            {joined ? <p className="mt-6 font-display text-2xl font-semibold">You're checked in. No inbox confetti. Promise.</p> : (
              <form onSubmit={joinNewsletter} className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input required type="email" value={newsletter} onChange={(event) => setNewsletter(event.target.value)} className="min-w-0 flex-1 rounded-full border-2 border-foreground bg-white px-4 py-3" placeholder="you@example.com" />
                <button className="dark-button justify-center">CHECK IN</button>
              </form>
            )}
            <p className="mt-4 text-xs text-muted-foreground">Prototype interaction only here. The real reader account and preferences are already being built separately.</p>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="memo text-coral">LATEST FROM THE RESORT</p><h2 className="mt-2 font-slab text-5xl uppercase">Something is always happening.</h2></div>
            <label className="flex items-center gap-2 rounded-full border-2 border-foreground bg-paper px-4 py-3"><Search size={18} /><span className="sr-only">Search prototype stories</span><input value={query} onChange={(event) => setQuery(event.target.value)} className="bg-transparent outline-none" placeholder="Search the resort" /></label>
          </div>
          <div className="mt-7 divide-y-2 divide-foreground border-y-2 border-foreground">
            {filtered.map((story) => (
              <Link key={story.slug} to="/journal/media-preview/$slug" params={{ slug: story.slug }} className="grid gap-3 py-5 sm:grid-cols-[8rem_1fr_auto] sm:items-center">
                <div className="memo text-coral">{story.age}</div>
                <div><p className="memo text-primary">{story.franchise}</p><h3 className="mt-1 font-display text-2xl font-semibold hover:underline">{story.title}</h3></div>
                <span className="memo">{story.readTime} min</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-t-2 border-foreground bg-[#bfe1dd] px-5 py-14 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[1fr_.8fr] lg:items-center">
          <div>
            <p className="memo text-coral">SOAP THAT TAKES YOU THERE</p>
            <h2 className="mt-2 font-slab text-[clamp(3rem,7vw,6rem)] uppercase leading-[.9]">A small escape still counts.</h2>
            <p className="mt-5 max-w-2xl font-display text-xl">The Journal earns attention first. The shop shows up when it actually belongs in the story.</p>
            <div className="mt-6 flex flex-wrap gap-3"><Link to="/" hash="shop" className="dark-button">Visit the Gift Shop</Link><Link to="/journal/join" className="secondary-button bg-paper">Free reader check-in</Link></div>
          </div>
          <div className="relative grid place-items-center">
            <Sun size={180} className="text-sun" fill="currentColor" />
            <Sparkles className="absolute right-[18%] top-[8%] text-coral" size={46} />
          </div>
        </div>
      </section>

      <IslandFooter />
    </main>
  );
}
