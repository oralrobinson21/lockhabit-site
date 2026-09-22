import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Atom,
  Ban,
  Beaker,
  ChevronDown,
  CircleOff,
  DnaOff,
  DropletOff,
  FlaskConical,
  Leaf,
  MilkOff,
  Minus,
  PackageX,
  Plus,
  Rabbit,
  Sparkles,
  Sprout,
  Sun,
  Waves,
  WheatOff,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { SiteHeader } from "@/components/site-header";
import { IslandFooter } from "@/components/island-footer";
import { useCart } from "@/lib/cart";
import { productBySlug, products, relatedProducts, type GalleryImage } from "@/lib/catalog";
import { productMeta, productStructuredData, threeBarOffer } from "@/lib/product-seo";

type ProductRouteSearch = {
  slug: string;
};

const cropPosition: Record<NonNullable<GalleryImage["crop"]>, string> = {
  "top-left": "0% 0%",
  "top-right": "100% 0%",
  "bottom-left": "0% 100%",
  "bottom-right": "100% 100%",
};

function GalleryMedia({
  image,
  className,
  decorative = false,
}: {
  image: GalleryImage;
  className: string;
  decorative?: boolean;
}) {
  if (image.crop) {
    return (
      <div
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : image.alt}
        aria-hidden={decorative || undefined}
        className={className}
        style={{
          backgroundImage: `url(${image.src})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "200% 200%",
          backgroundPosition: cropPosition[image.crop],
        }}
      />
    );
  }

  return (
    <img
      src={image.src}
      alt={decorative ? "" : image.alt}
      loading={decorative ? "lazy" : undefined}
      width={1024}
      height={1024}
      className={className}
    />
  );
}

function BadgeDrawing({ size, children }: { size: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function AttributeGlyph({ attribute, size }: { attribute: string; size: number }) {
  const key = attribute.toLowerCase();

  if (key === "cruelty free") return <Rabbit size={size} strokeWidth={1.8} />;
  if (key === "vegan") return <Leaf size={size} strokeWidth={1.8} />;
  if (key === "vegetarian") return <Sprout size={size} strokeWidth={1.8} />;

  if (key === "100% natural")
    return (
      <BadgeDrawing size={size}>
        <path d="M24 39V22" />
        <path d="M24 25C17 24 12 19 12 12c7 0 12 4 12 11" />
        <path d="M25 27c2-8 8-13 16-14-1 8-6 13-16 14Z" />
        <path d="M23 31c-5-1-9-4-11-9" />
      </BadgeDrawing>
    );

  if (key === "non-gmo")
    return <span className="text-[13px] font-black tracking-[-0.05em]">GMO</span>;

  if (key === "gluten free") return <WheatOff size={size} strokeWidth={1.8} />;

  if (key === "corn free")
    return (
      <BadgeDrawing size={size}>
        <path d="M25 8c7 5 9 15 5 24-3 7-9 9-14 5-5-4-4-11 0-18 3-6 6-9 9-11Z" />
        <path d="M20 15l9 15M18 21l11-5M17 28l13-5" />
        <path d="M14 38c-2-8 0-14 5-18M32 36c4-7 4-13 0-18" />
      </BadgeDrawing>
    );

  if (key === "lactose free") return <MilkOff size={size} strokeWidth={1.8} />;
  if (key === "hormone free") return <DnaOff size={size} strokeWidth={1.8} />;

  if (key === "alcohol free")
    return (
      <BadgeDrawing size={size}>
        <path d="M19 7h10v7l5 7v17c0 2-2 3-4 3H18c-2 0-4-1-4-3V21l5-7V7Z" />
        <path d="M18 27h12" />
        <path d="M24 31c-2 2-3 4-3 5a3 3 0 0 0 6 0c0-1-1-3-3-5Z" />
      </BadgeDrawing>
    );

  if (key === "sulfate free") return <Atom size={size} strokeWidth={1.8} />;

  if (key === "no fillers")
    return (
      <BadgeDrawing size={size}>
        <path d="M11 31 24 18a6 6 0 0 1 9 9L20 40a6 6 0 0 1-9-9Z" />
        <path d="m17 25 9 9" />
        <circle cx="14" cy="13" r="3" />
        <circle cx="24" cy="9" r="2.5" />
      </BadgeDrawing>
    );

  if (key === "paraben free")
    return (
      <BadgeDrawing size={size}>
        <path d="M15 15h18l-2 25H17l-2-25Z" />
        <path d="M18 9h12v6H18V9Z" />
        <path d="M24 34v-8" />
        <path d="M24 28c-5 0-7-3-7-7 5 0 7 2 7 7Z" />
        <path d="M25 29c1-5 4-7 8-7-1 5-3 7-8 7Z" />
      </BadgeDrawing>
    );

  if (key === "phthalate free")
    return (
      <BadgeDrawing size={size}>
        <path d="m12 31 19-19 5 5-19 19-7 2 2-7Z" />
        <path d="m27 16 5 5" />
        <path d="M15 35c3 1 5 3 5 5" />
      </BadgeDrawing>
    );

  if (key === "silicone free") return <FlaskConical size={size} strokeWidth={1.8} />;

  if (key === "mineral oil free")
    return (
      <BadgeDrawing size={size}>
        <path d="M17 9h14v8l4 5v16c0 2-2 3-4 3H17c-2 0-4-1-4-3V22l4-5V9Z" />
        <path d="M17 16h14" />
        <path d="M24 25c-4 5-5 7-5 9a5 5 0 0 0 10 0c0-2-1-4-5-9Z" />
      </BadgeDrawing>
    );

  if (key === "antibiotic free")
    return (
      <BadgeDrawing size={size}>
        <path d="M13 31 30 14a7 7 0 0 1 10 10L23 41a7 7 0 0 1-10-10Z" />
        <path d="m21 23 10 10" />
        <path d="M9 11h10M14 6v10" />
      </BadgeDrawing>
    );

  if (key === "allergen free")
    return (
      <BadgeDrawing size={size}>
        <circle cx="24" cy="24" r="4" />
        <path d="M24 8c4 4 4 8 0 12-4-4-4-8 0-12ZM40 24c-4 4-8 4-12 0 4-4 8-4 12 0ZM24 40c-4-4-4-8 0-12 4 4 4 8 0 12ZM8 24c4-4 8-4 12 0-4 4-8 4-12 0Z" />
      </BadgeDrawing>
    );

  if (key === "fragrance free")
    return (
      <BadgeDrawing size={size}>
        <path d="M20 8h8v7l5 7v17H15V22l5-7V8Z" />
        <path d="M19 29c3-3 7-3 10 0" />
      </BadgeDrawing>
    );

  return <Ban size={size} strokeWidth={1.8} />;
}

const crossedAttributePattern =
  /^(non-gmo|gluten free|hormone free|alcohol free|no fillers|phthalate free|silicone free|mineral oil free|antibiotic free)$/i;

function AttributeSeal({
  attribute,
  compact = false,
  featuredIndex,
}: {
  attribute: string;
  compact?: boolean;
  featuredIndex?: number;
}) {
  const isCrossed = crossedAttributePattern.test(attribute);
  const size = compact ? 23 : 34;
  const featuredTint =
    featuredIndex === undefined
      ? "border-[#3d2a20] bg-[#fffdf7]"
      : featuredIndex === 1
        ? "border-[#4a2b20] bg-[#fff0b8]"
        : "border-[#167e6b] bg-[#d9f5ee]";

  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      <div
        className={`relative flex items-center justify-center rounded-full border-2 ${featuredTint} ${
          compact ? "size-[3.15rem] sm:size-[3.7rem]" : "size-[4.65rem] sm:size-20"
        }`}
        aria-hidden="true"
      >
        <AttributeGlyph attribute={attribute} size={size} />
        {isCrossed ? (
          <span className="absolute h-[2px] w-[74%] -rotate-45 rounded-full bg-foreground" />
        ) : null}
      </div>
      <span
        className={`font-black uppercase leading-[1.02] tracking-[0.025em] ${
          compact
            ? "max-w-[4rem] text-[8px] sm:max-w-[4.7rem] sm:text-[9px]"
            : "max-w-[5.6rem] text-[10px] sm:text-[11px]"
        }`}
      >
        {attribute}
      </span>
    </div>
  );
}

export const Route = createFileRoute("/soaps/$slug")({
  head: ({ params }) => {
    const product = productBySlug(params.slug);
    const meta = product ? productMeta(product) : null;

    return {
      meta:
        product && meta
          ? [
              { title: meta.title },
              { name: "description", content: meta.description },
              { property: "og:title", content: meta.title },
              { property: "og:description", content: meta.description },
              { property: "og:type", content: "product" },
              { property: "og:url", content: meta.canonical },
              { property: "og:image", content: meta.image },
              { property: "og:image:alt", content: product.images[0]?.alt ?? product.name },
              { property: "product:price:amount", content: product.price.toFixed(2) },
              { property: "product:price:currency", content: "USD" },
              { name: "twitter:card", content: "summary_large_image" },
              { name: "twitter:title", content: meta.title },
              { name: "twitter:description", content: meta.description },
              { name: "twitter:image", content: meta.image },
            ]
          : [
              { title: "Soap not found | LOCKHABIT SOAP CO." },
              {
                name: "description",
                content: "This bar has checked out. Browse the full LOCKHABIT catalog instead.",
              },
              { property: "og:type", content: "website" },
              { name: "twitter:card", content: "summary_large_image" },
            ],
      links: meta ? [{ rel: "canonical", href: meta.canonical }] : [],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams() as ProductRouteSearch;
  const product = productBySlug(slug);
  if (!product) throw notFound();
  return <ProductView slug={slug} />;
}

function ProductView({ slug }: { slug: string }) {
  const product = productBySlug(slug);
  if (!product) throw notFound();
  const { addToCart } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const related = relatedProducts(product);
  const catalogIndex = products.findIndex((candidate) => candidate.id === product.id);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const structuredData = productStructuredData(product);
  const ingredientLine =
    product.ingredientStatement ??
    product.ingredients
      .map((ingredient) => ingredient.charAt(0).toUpperCase() + ingredient.slice(1))
      .join(", ") + ".";

  useEffect(() => {
    const node = sceneRef.current;
    if (!node) return;
    node.style.setProperty("--scene-from", product.scene.from);
    node.style.setProperty("--scene-to", product.scene.to);
    node.style.setProperty("--scene-motes", product.scene.motes);
  }, [product]);

  useEffect(() => {
    setActiveImage(0);
    window.scrollTo({ top: 0 });
  }, [slug]);

  return (
    <main className="overflow-x-hidden bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="grain relative overflow-hidden" ref={sceneRef}>
        <div
          className={`product-scene-sky scene-bg-${product.id} absolute inset-0`}
          aria-hidden="true"
        />
        <div
          className={`product-scene-motes scene-${product.id} absolute inset-0 overflow-hidden`}
          aria-hidden="true"
        >
          {[...Array(9)].map((_, index) => (
            <span
              key={index}
              className="product-mote"
              style={
                {
                  "--mote-delay": `${-index * 3.7}s`,
                  "--mote-x": `${8 + index * 10.5}%`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        <div className="relative">
          <SiteHeader />

          <section className="mx-auto max-w-7xl px-5 pt-10 pb-16 lg:px-10 lg:pt-14">
            <nav
              aria-label="Breadcrumb"
              className="memo flex flex-wrap items-center gap-2 text-foreground/70"
            >
              <Link to="/" className="inline-flex items-center gap-2 hover:text-foreground">
                <ArrowLeft size={14} /> Home
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{product.name}</span>
            </nav>

            <div className="mt-8 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16">
              <div>
                <div className="retro-frame aspect-square bg-muted">
                  <GalleryMedia
                    key={`${product.images[activeImage]?.src}-${product.images[activeImage]?.crop ?? "full"}`}
                    image={product.images[activeImage]}
                    className={`h-full w-full animate-gallery-in ${activeImage === 0 ? "bg-paper object-contain p-3 sm:p-6" : "bg-center object-cover"}`}
                  />
                </div>
                <div
                  className="mt-4 grid grid-cols-4 gap-3"
                  aria-label={`${product.name} image gallery`}
                >
                  {product.images.map((image, index) => (
                    <button
                      key={`${image.src}-${image.crop ?? index}`}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={`aspect-square overflow-hidden rounded-xl border-2 transition ${activeImage === index ? "border-foreground shadow-[3px_3px_0_var(--color-foreground)]" : "border-foreground/25 opacity-70 hover:opacity-100"}`}
                      aria-label={`View ${product.name} image ${index + 1}`}
                      aria-pressed={activeImage === index}
                    >
                      <GalleryMedia
                        image={image}
                        decorative
                        className="h-full w-full bg-center object-cover"
                      />
                    </button>
                  ))}
                </div>
                {product.images.some((image) => image.illustrative) ? (
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    Lifestyle scenes are illustrative. The original product photos remain in the
                    gallery so you can see the actual item you'll receive.
                  </p>
                ) : null}
              </div>

              <div>
                <p className="eyebrow">
                  No. {String(catalogIndex + 1).padStart(2, "0")} · {product.productType}
                </p>
                <h1 className="section-title">{product.name}</h1>
                <p className="memo mt-3 text-muted-foreground">{product.note}</p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <span className="price-tag">${product.price.toFixed(2)}</span>
                  <span className="memo text-muted-foreground">{product.netWeight}</span>
                </div>
                <p className="mt-7 max-w-lg font-display text-2xl italic leading-snug">
                  {product.tagline}
                </p>
                <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
                  {product.description}
                </p>

                <ul className="mt-8 grid gap-3 border-y-2 border-foreground/15 py-6 text-sm font-bold sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {product.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-center gap-2">
                      <Sparkles size={17} className="text-primary" /> {highlight}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button className="primary-button" onClick={() => addToCart(product.id)}>
                    Add to bag <Plus size={18} />
                  </button>
                  <Link to="/" hash="shop" className="secondary-button">
                    See all twelve <ArrowRight size={16} />
                  </Link>
                </div>
                <p className="memo mt-4 text-muted-foreground">
                  Orders under ${threeBarOffer.freeShippingAt} ship for $7.95.{" "}
                  <Link
                    to="/shipping"
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    Shipping details
                  </Link>
                </p>
                {product.kind === "Soap bar" ? (
                  <div className="paper-card mt-5 p-5">
                    <p className="memo text-muted-foreground">The longer stay</p>
                    <p className="mt-2 font-display text-2xl font-semibold leading-tight">
                      3 bars for ${threeBarOffer.price}
                    </p>
                    <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                      ${threeBarOffer.savings} off three single bars, and the order ships free. Same
                      bar, stocked for the month.
                    </p>
                    <button
                      className="primary-button mt-4"
                      onClick={() => addToCart(product.id, 3)}
                    >
                      Add 3 bars <Plus size={18} />
                    </button>
                  </div>
                ) : null}

                {product.attributes?.length ? (
                  <section className="mt-10" aria-label={`${product.name} product attributes`}>
                    <div className="grid grid-cols-4 gap-x-3 gap-y-5">
                      {product.attributes.map((attribute, index) => (
                        <AttributeSeal
                          key={attribute}
                          attribute={attribute}
                          featuredIndex={index}
                        />
                      ))}
                    </div>

                    {product.allAttributes?.length ? (
                      <details className="group mt-7 overflow-hidden rounded-[1.35rem] border border-[#bfe9e2] bg-[#fffdf7]">
                        <summary className="flex cursor-pointer list-none items-center gap-3 bg-gradient-to-r from-[#c9f3ed] via-[#e2f8f3] to-[#cff3ee] px-4 py-4 sm:px-5">
                          <Sparkles size={25} className="shrink-0" fill="currentColor" />
                          <div className="min-w-0 flex-1">
                            <span className="block font-display text-[1.05rem] font-bold leading-tight">
                              Good clean details
                            </span>
                            <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                              The good stuff, none of the bad stuff.
                            </span>
                          </div>
                          <ChevronDown
                            size={25}
                            strokeWidth={3}
                            className="shrink-0 transition-transform group-open:rotate-180"
                          />
                        </summary>

                        <div className="grid grid-cols-5 gap-x-1.5 gap-y-6 px-3 py-6 sm:gap-x-3 sm:px-5">
                          {product.allAttributes.map((attribute) => (
                            <AttributeSeal key={attribute} attribute={attribute} compact />
                          ))}
                        </div>
                      </details>
                    ) : null}
                  </section>
                ) : null}

                {product.productStory ? (
                  <>
                    <div className="paper-card mt-10 overflow-hidden">
                      <details className="group border-b-2 border-foreground/15 p-6" open>
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                          <h2 className="memo">Meet {product.name.replace(/ Soap$/, "")}</h2>
                          <Plus size={16} className="transition-transform group-open:rotate-45" />
                        </summary>
                        <p className="mt-4 text-sm leading-7 text-muted-foreground">
                          {product.productStory}
                        </p>
                      </details>

                      <details className="group border-b-2 border-foreground/15 p-6">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                          <h2 className="memo">What's inside</h2>
                          <Plus size={16} className="transition-transform group-open:rotate-45" />
                        </summary>
                        <p className="mt-4 text-sm leading-7">{ingredientLine}</p>
                      </details>

                      <details className="group border-b-2 border-foreground/15 p-6">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                          <h2 className="memo">How to use it</h2>
                          <Plus size={16} className="transition-transform group-open:rotate-45" />
                        </summary>
                        <p className="mt-4 text-sm leading-7">{product.suggestedUse}</p>
                      </details>

                      <details className="group p-6">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                          <h2 className="memo">The fine print</h2>
                          <Plus size={16} className="transition-transform group-open:rotate-45" />
                        </summary>
                        <div className="mt-4 grid gap-4 text-sm leading-6 sm:grid-cols-2">
                          <div>
                            <p className="memo text-muted-foreground">Net weight</p>
                            <p className="mt-1">{product.netWeight}</p>
                          </div>
                          {product.madeIn ? (
                            <div>
                              <p className="memo text-muted-foreground">Country of manufacture</p>
                              <p className="mt-1">{product.madeIn}</p>
                            </div>
                          ) : null}
                        </div>
                        <div className="mt-5 border-t-2 border-foreground/15 pt-5">
                          <p className="memo text-muted-foreground">Warning</p>
                          <p className="mt-2 text-sm leading-6">{product.warning}</p>
                        </div>
                        <p className="memo mt-5 text-muted-foreground">
                          Manufactured for and distributed by LOCKHABIT · Bronx, New York
                        </p>
                      </details>
                    </div>

                    {product.faqs?.length ? (
                      <section
                        className="paper-card mt-6 overflow-hidden"
                        aria-labelledby={`${product.slug}-faq-title`}
                      >
                        <div className="border-b-2 border-foreground/15 p-6">
                          <p className="eyebrow">Before you check in</p>
                          <h2
                            id={`${product.slug}-faq-title`}
                            className="font-display text-2xl font-semibold"
                          >
                            {product.name.replace(/ Soap$/, "")} questions
                          </h2>
                        </div>
                        {product.faqs.map((faq, index) => (
                          <details
                            key={faq.question}
                            className={`group p-6 ${index === product.faqs!.length - 1 ? "" : "border-b-2 border-foreground/15"}`}
                          >
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                              <h3 className="memo">{faq.question}</h3>
                              <Plus
                                size={16}
                                className="transition-transform group-open:rotate-45"
                              />
                            </summary>
                            <p className="mt-4 text-sm leading-7 text-muted-foreground">
                              {faq.answer}
                            </p>
                          </details>
                        ))}
                      </section>
                    ) : null}
                  </>
                ) : (
                  <div className="paper-card mt-10 p-6">
                    <p className="memo text-muted-foreground">What's inside</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {product.ingredients.map((ingredient) => (
                        <span
                          key={ingredient}
                          className="memo inline-flex items-center gap-2 rounded-full border-2 border-foreground/20 px-3 py-1.5 normal-case tracking-normal"
                        >
                          <Leaf size={12} className="text-primary" /> {ingredient}
                        </span>
                      ))}
                    </div>
                    <div className="mt-7 grid gap-5 border-t-2 border-foreground/15 pt-6 sm:grid-cols-2">
                      <div>
                        <p className="memo text-muted-foreground">Suggested use</p>
                        <p className="mt-2 text-sm leading-6">{product.suggestedUse}</p>
                      </div>
                      <div>
                        <p className="memo text-muted-foreground">Warning</p>
                        <p className="mt-2 text-sm leading-6">{product.warning}</p>
                      </div>
                    </div>
                    <p className="memo mt-6 text-muted-foreground">
                      Manufactured for and distributed by LOCKHABIT · Bronx, New York
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="border-y-2 border-foreground bg-secondary px-5 py-16 lg:px-10">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <Waves size={20} className="text-primary" />
                <p className="memo">4 oz bar · easy everyday ritual</p>
              </div>
              <div className="flex items-center gap-3">
                <Sun size={20} className="text-primary" />
                <p className="memo">Warm scents · brighter showers</p>
              </div>
              <div className="flex items-center gap-3">
                <Minus size={20} className="text-primary" />
                <p className="memo">Exact ingredients listed on every product page</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="px-5 py-20 sm:py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">You may also like</p>
              <h2 className="section-title">
                Check in
                <br />
                <em>next door.</em>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Bars that pair well with {product.name.toLowerCase()}, chosen by the front desk.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((candidate) => (
              <article
                key={candidate.id}
                className="paper-card group flex h-full flex-col overflow-hidden"
              >
                <Link
                  to="/soaps/$slug"
                  params={{ slug: candidate.slug }}
                  className="relative aspect-square overflow-hidden border-b-2 border-foreground bg-muted"
                  aria-label={`View ${candidate.name}`}
                >
                  <img
                    src={candidate.images[1]?.src ?? candidate.images[0]?.src}
                    alt={candidate.images[1]?.alt ?? candidate.name}
                    loading="lazy"
                    width={816}
                    height={816}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to="/soaps/$slug"
                      params={{ slug: candidate.slug }}
                      className="font-display text-xl leading-tight font-semibold hover:underline"
                    >
                      {candidate.name}
                    </Link>
                    <span className="price-tag shrink-0">${candidate.price.toFixed(2)}</span>
                  </div>
                  <p className="memo mt-2 text-muted-foreground">{candidate.note}</p>
                  <div className="min-h-5 flex-1" />
                  <button
                    className="secondary-button w-full"
                    onClick={() => addToCart(candidate.id)}
                  >
                    Add to bag <Plus size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <IslandFooter />
    </main>
  );
}
