import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { IslandFooter } from "@/components/island-footer";
import { SiteHeader } from "@/components/site-header";
import { prototypeAuthor, prototypeStories } from "@/lib/journal-prototype-data";

export const Route = createFileRoute("/journal/media-preview/author/$slug")({
  loader: ({ params }) => {
    const author = prototypeAuthor(params.slug);
    if (!author) throw notFound();
    return { author, stories: prototypeStories.filter((story) => story.author === author.slug) };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: (loaderData?.author.name ?? "Author") + " · LOCKHABIT Media Prototype" },
      { name: "robots", content: "noindex,nofollow,noarchive" },
    ],
  }),
  component: PrototypeAuthorPage,
});

function PrototypeAuthorPage() {
  const { author, stories } = Route.useLoaderData();
  return (
    <main className="min-h-screen bg-[#f8f0dd] text-[#173c2d]">
      <SiteHeader />
      <section className="border-b-2 border-foreground bg-[#bfe1dd] px-5 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-5xl">
          <Link to="/journal/media-preview" className="inline-flex items-center gap-2 font-bold underline underline-offset-4"><ArrowLeft size={16} /> Resort Daily</Link>
          <div className="mt-8 grid gap-7 sm:grid-cols-[220px_1fr] sm:items-center">
            <img src={author.image} alt="" className="aspect-square w-full rotate-[-2deg] border-2 border-foreground object-cover shadow-[7px_7px_0_var(--color-foreground)]" />
            <div>
              <p className="memo text-coral">{author.desk}</p>
              <h1 className="mt-2 font-slab text-6xl uppercase">{author.name}</h1>
              <p className="mt-3 font-display text-2xl">{author.line}</p>
              <p className="mt-5 max-w-2xl leading-7">{author.bio}</p>
              <button type="button" className="dark-button mt-5">Follow {author.name} · prototype</button>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-12 lg:px-10">
        <p className="memo text-primary">LATEST FROM {author.name.toUpperCase()}</p>
        <div className="mt-5 divide-y-2 divide-foreground border-y-2 border-foreground">
          {stories.map((story) => (
            <Link key={story.slug} to="/journal/media-preview/$slug" params={{ slug: story.slug }} className="grid gap-3 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div><p className="memo text-coral">{story.franchise}</p><h2 className="mt-1 font-display text-2xl font-semibold hover:underline">{story.title}</h2><p className="mt-2 text-sm text-muted-foreground">{story.dek}</p></div>
              <span className="memo">{story.readTime} min</span>
            </Link>
          ))}
        </div>
      </section>
      <IslandFooter />
    </main>
  );
}
