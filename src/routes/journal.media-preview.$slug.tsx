import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { JournalReaderTools } from "@/components/journal-reader-tools";
import { IslandFooter } from "@/components/island-footer";
import { SiteHeader } from "@/components/site-header";
import { prototypeAuthor, prototypeStory } from "@/lib/journal-prototype-data";

export const Route = createFileRoute("/journal/media-preview/$slug")({
  loader: ({ params }) => {
    const story = prototypeStory(params.slug);
    if (!story) throw notFound();
    return { story, author: prototypeAuthor(story.author)! };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: (loaderData?.story.title ?? "Story") + " · LOCKHABIT Media Prototype" },
      { name: "robots", content: "noindex,nofollow,noarchive" },
    ],
  }),
  component: PrototypeArticle,
});

function PrototypeArticle() {
  const { story, author } = Route.useLoaderData();
  const readerText = [story.title, story.dek, ...story.body].join(". ");

  return (
    <main className="min-h-screen bg-[#f8f0dd] text-[#173c2d]">
      <SiteHeader />
      <article>
        <header className="border-b-2 border-foreground bg-paper px-5 py-12 lg:px-10 lg:py-16">
          <div className="mx-auto max-w-5xl">
            <Link to="/journal/media-preview" className="inline-flex items-center gap-2 font-bold underline underline-offset-4"><ArrowLeft size={16} /> Back to the Resort Daily</Link>
            <p className="memo mt-8 text-coral">{story.franchise} · {story.category}</p>
            <h1 className="mt-3 font-slab text-[clamp(3rem,8vw,6.5rem)] uppercase leading-[.88]">{story.title}</h1>
            <p className="mt-6 max-w-3xl font-display text-xl leading-relaxed">{story.dek}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <img src={author.image} alt="" className="h-10 w-10 rounded-full border-2 border-foreground object-cover" />
              <Link to="/journal/media-preview/author/$slug" params={{ slug: author.slug }} className="font-bold underline underline-offset-4">{author.name}</Link>
              <span>·</span><span>{author.desk}</span><span>·</span><span>{story.readTime} min read</span>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-5xl px-5 py-10 lg:px-10">
          <img src={story.image} alt="" className="mb-8 aspect-[16/9] w-full border-2 border-foreground object-cover shadow-[7px_7px_0_var(--color-foreground)]" />
          <JournalReaderTools slug={story.slug} title={story.title} text={readerText} />
          <div className="grid gap-8 lg:grid-cols-[1fr_230px]">
            <div className="space-y-7 font-display text-xl leading-9">
              {story.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              <p className="border-l-4 border-coral pl-5 font-sans text-base leading-7"><strong>Prototype editorial note:</strong> factual health/wellness stories would not publish from this mock data. The production editor requires article-specific sourcing and review.</p>
              {story.sources.length ? (
                <section className="mt-12 border-t-2 border-foreground pt-7 font-sans">
                  <p className="memo text-primary">THE RECEIPTS</p>
                  <h2 className="mt-2 font-display text-3xl font-semibold">Sources and further reading.</h2>
                  <ul className="mt-4 space-y-3 text-sm">
                    {story.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-bold text-primary underline underline-offset-4">{source.label}<ExternalLink size={14} /></a></li>)}
                  </ul>
                </section>
              ) : null}
            </div>
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rotate-1 border-2 border-foreground bg-sun p-5 shadow-[5px_5px_0_var(--color-foreground)]">
                <p className="memo">FRONT DESK NOTE</p>
                <p className="mt-2 font-display text-xl font-semibold">{author.line}</p>
                <p className="mt-3 text-sm leading-6">The article experience keeps sources, author identity, read-aloud, sharing, reactions, saves, and future comments in one place.</p>
              </div>
            </aside>
          </div>
        </div>
      </article>
      <IslandFooter />
    </main>
  );
}
