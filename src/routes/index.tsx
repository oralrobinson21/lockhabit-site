import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowDown, Leaf, Plus, Send, Sparkles, Waves } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { SiteHeader } from "@/components/site-header";
import { useCart } from "@/lib/cart";

import heroImage from "@/assets/lockhabit-hero-real-product.jpg";
import heroVideo from "@/assets/lockhabit-hero-real-loop.mp4";
import logoTransparent from "@/assets/lockhabit-logo-transparent.png";
import { products } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LOCKHABIT SOAP CO. | Permanent Vacation for Your Skin" },
      {
        name: "description",
        content:
          "LOCKHABIT Soap Co. — a sun-soaked soap company with twelve botanical bars, one concierge desk, and zero plans to go back to work.",
      },
      { property: "og:title", content: "LOCKHABIT SOAP CO. | Permanent Vacation for Your Skin" },
      {
        property: "og:description",
        content:
          "Twelve tropical botanical bars from the sunniest soap company in the business. Now open, always warm.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const services = [
  {
    title: "The Daily Ritual",
    text: "Wake up, lather up, walk outside like you own the beach. Repeat forever.",
    label: "Dept. 01",
    tone: "bg-secondary",
  },
  {
    title: "Scent Matching",
    text: "Tell us your mood and we'll point you at the bar that fixes it. Usually citrus.",
    label: "Dept. 02",
    tone: "bg-sun",
  },
  {
    title: "Gift Notes",
    text: "Hand-written, slightly sandy, always sincere. Tucked in with your order.",
    label: "Dept. 03",
    tone: "bg-coral text-coral-foreground",
  },
];

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function Index() {
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const { addToCart, addBundle } = useCart();
  const [activeGalleryImage, setActiveGalleryImage] = useState(0);
  const [postcardSent, setPostcardSent] = useState(false);
  const featured = products[0]!;
  const featuredGallery = featured.images;

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePlayback = () => {
      if (motionPreference.matches) {
        video.pause();
        video.currentTime = 0;
      } else {
        void video.play().catch(() => undefined);
      }
    };
    updatePlayback();
    motionPreference.addEventListener("change", updatePlayback);
    return () => motionPreference.removeEventListener("change", updatePlayback);
  }, []);

  const scrollToShop = () =>
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="overflow-x-hidden bg-background text-foreground">
      <SiteHeader />
      <section
        id="top"
        className="grain relative flex min-h-[86vh] items-end overflow-hidden text-hero-foreground"
      >
        <video
          ref={heroVideoRef}
          className="absolute inset-0 h-full w-full object-cover object-[68%_center]"
          autoPlay
          muted
          loop
          playsInline
          poster={heroImage}
          aria-label="LOCKHABIT coconut soap beside a gently moving tropical lagoon"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="hero-water-motion" aria-hidden="true">
          <span className="hero-wave-surge" />
          <span className="hero-foam-crown" />
          <span className="hero-suds-fall" />
        </div>
        <div className="hero-shade absolute inset-0" />
        <div className="fishing-lines" aria-hidden="true">
          <span />
          <span />
        </div>
        <button className="bundle-catch" onClick={() => scrollToShop()}>
          <span>THE BUNDLE CATCH</span>3 BARS $89 · 6 BARS $169
          <small>+ FREE BAR WITH EVERY 3-PACK</small>
        </button>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-24 lg:px-10 lg:pb-20">
          <div className="max-w-2xl animate-rise">
            <p className="memo mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-sun" /> LOCKHABIT Soap Co. · Est. in the sun
            </p>
            <h1 className="slab-title">
              PERMANENT
              <br />
              VACATION
              <br />
              FOR YOUR SKIN.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-hero-muted sm:text-lg">
              Twelve botanical bars made for slow mornings, warm tile, and the kind of day where
              nothing is urgent. Check in whenever.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <button onClick={scrollToShop} className="primary-button">
                SHOP THE CATALOG <ArrowRight size={18} />
              </button>
              <span className="memo">BARS $35 · BUNDLES FROM $89</span>
            </div>
          </div>
          <div className="pointer-events-none absolute -top-2 right-5 hidden gap-4 lg:flex">
            <div className="sticker pointer-events-auto h-24 w-24 -rotate-12 bg-sun text-sun-foreground">
              SPF of
              <br />
              the soul
            </div>
            <div className="sticker pointer-events-auto mt-12 h-24 w-24 rotate-[8deg] bg-secondary text-secondary-foreground">
              Sun
              <br />
              tested
            </div>
          </div>
          <a
            href="#featured"
            aria-label="Keep scrolling"
            className="absolute right-6 bottom-8 hidden h-14 w-14 items-center justify-center rounded-full border-2 border-hero-foreground/50 lg:flex"
          >
            <ArrowDown size={20} className="animate-bob" />
          </a>
        </div>
      </section>

      <section
        className="border-y-2 border-foreground bg-primary py-3 text-primary-foreground"
        aria-label="Product qualities"
      >
        <div className="marquee-track memo">
          {[false, true].map((hidden) => (
            <div className="marquee-group" aria-hidden={hidden || undefined} key={String(hidden)}>
              {[
                "TOWEL INCLUDED (MENTALLY)",
                "PLANT POWERED",
                "TOWEL INCLUDED (MENTALLY)",
                "PLANT POWERED",
              ].map((item, index) => (
                <span key={`${item}-${index}`} className="flex shrink-0 items-center gap-12">
                  <span>{item}</span>
                  <span className="text-sun">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section id="featured" className="scroll-mt-24 bg-secondary px-5 py-20 sm:py-28 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20">
          <Reveal>
            <Link
              to="/soaps/$slug"
              params={{ slug: featured.slug }}
              className="block"
              aria-label={`View ${featured.name}`}
            >
              <div className="retro-frame aspect-square bg-muted">
                {featuredGallery[activeGalleryImage] && (
                  <img
                    key={featuredGallery[activeGalleryImage].src}
                    src={featuredGallery[activeGalleryImage].src}
                    alt={featuredGallery[activeGalleryImage].alt}
                    width={1024}
                    height={1024}
                    className="h-full w-full animate-gallery-in object-cover"
                  />
                )}
              </div>
            </Link>
            <div className="mt-4 grid grid-cols-5 gap-3" aria-label="Coconut Beach image gallery">
              {featuredGallery.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => setActiveGalleryImage(index)}
                  className={`aspect-square overflow-hidden rounded-xl border-2 transition ${activeGalleryImage === index ? "border-foreground shadow-[3px_3px_0_var(--color-foreground)]" : "border-foreground/25 opacity-70 hover:opacity-100"}`}
                  aria-label={`View Coconut Beach image ${index + 1}`}
                  aria-pressed={activeGalleryImage === index}
                >
                  <img
                    src={image.src}
                    alt=""
                    loading="lazy"
                    width={220}
                    height={220}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <p className="eyebrow">Room service favorite</p>
            <h2 className="section-title">
              Coconut
              <br />
              <em>Beach Soap.</em>
            </h2>
            <div className="mt-6 flex items-center gap-4">
              <span className="sticker h-auto rotate-[-3deg] bg-coral px-3 py-1.5 text-coral-foreground">
                Best seller
              </span>
              <span className="price-tag">$35.00</span>
            </div>
            <p className="mt-7 max-w-lg text-base leading-7 text-muted-foreground">
              A creamy, sunlit cleanse inspired by slow mornings near the water. Coconut-rich lather
              leaves skin soft, fresh, and entirely unbothered by your calendar.
            </p>
            <ul className="mt-8 grid gap-3 border-y-2 border-foreground/15 py-6 text-sm font-bold sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <li className="flex items-center gap-2">
                <Leaf size={17} className="text-primary" /> PLANT POWERED
              </li>
              <li className="flex items-center gap-2">
                <Sparkles size={17} className="text-primary" /> Creamy lather
              </li>
              <li className="flex items-center gap-2">
                <Waves size={17} className="text-primary" /> Island inspired
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-4">
              <button className="primary-button" onClick={() => addToCart(featured.id)}>
                Add Coconut Beach to bag <Plus size={18} />
              </button>
              <Link to="/soaps/$slug" params={{ slug: featured.slug }} className="secondary-button">
                View the bar <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        className="border-y-2 border-foreground bg-sun px-5 py-16 text-sun-foreground lg:px-10"
        aria-labelledby="bundle-heading"
      >
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow text-sun-foreground">Bundle plans · launch catch</p>
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <h2 id="bundle-heading" className="section-title">
              Hook a set.
              <br />
              <em>Save the haul.</em>
            </h2>
            <p className="max-w-md text-sm font-semibold leading-6">
              Build your own 3 for $89 or 6 for $169. Every launch-week 3-pack gets one surprise bar
              free. Subscribe monthly and save another 15%.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { name: "The Calm Set", copy: "Slumber · Lavender · Oat Milk Honey", ids: [4, 9, 8] },
              {
                name: "The Glow Set",
                copy: "Kojic & Turmeric · Charcoal · Luffa",
                ids: [12, 10, 5],
              },
              {
                name: "The Fresh Set",
                copy: "Breathe Clear · Aloe & Cucumber · Lemongrass & Sage",
                ids: [2, 3, 6],
              },
            ].map((bundle) => (
              <article
                key={bundle.name}
                className="paper-card flex flex-col bg-paper p-6 text-foreground"
              >
                <p className="memo text-primary">3 bars + 1 surprise bar</p>
                <h3 className="mt-3 font-display text-3xl font-semibold">{bundle.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
                  {bundle.copy}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="price-tag">$89</span>
                  <span className="memo">Save $16</span>
                </div>
                <button
                  className="secondary-button mt-5 w-full"
                  onClick={() => addBundle(bundle.ids)}
                >
                  Catch this set <Plus size={16} />
                </button>
              </article>
            ))}
          </div>
          <p className="memo mt-8 text-center">
            Build your own: add any 3 or 6 soap bars and the discount lands in your bag
            automatically · Free shipping $75+
          </p>
        </div>
      </section>

      <section id="desk" className="scroll-mt-24 px-5 py-20 sm:py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-12 max-w-2xl">
            <p className="eyebrow">The front desk</p>
            <h2 className="section-title">
              How may we
              <br />
              <em>help you relax?</em>
            </h2>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {services.map((service, index) => (
              <Reveal key={service.title} delay={index * 110}>
                <article className={`paper-card h-full p-7 ${service.tone}`}>
                  <p className="memo opacity-70">{service.label}</p>
                  <h3 className="mt-5 font-display text-3xl font-semibold">{service.title}</h3>
                  <p className="mt-3 text-sm leading-6">{service.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        id="shop"
        className="scroll-mt-24 border-y-2 border-foreground bg-secondary px-5 py-20 sm:py-28 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Catalog · Vol. 1</p>
              <h2 className="section-title">
                Twelve ways
                <br />
                <em>to check out.</em>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Every bar in the collection, from bright and citrusy to warm and deeply soothing. No
              wrong choices here.
            </p>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <Reveal key={product.id} delay={(index % 4) * 90}>
                <article className="paper-card group flex h-full flex-col overflow-hidden">
                  <Link
                    to="/soaps/$slug"
                    params={{ slug: product.slug }}
                    className="relative aspect-square overflow-hidden border-b-2 border-foreground bg-muted"
                    aria-label={`View ${product.name}`}
                  >
                    <img
                      src={product.images[1]?.src ?? product.images[0]?.src}
                      alt={product.images[1]?.alt ?? product.name}
                      loading="lazy"
                      width={816}
                      height={816}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                    />
                    <span className="memo absolute top-3 left-3 rounded-full border-2 border-foreground bg-background px-2.5 py-1">
                      No. {String(index + 1).padStart(2, "0")}
                    </span>
                    {index === 0 && (
                      <span className="sticker absolute bottom-3 right-3 h-16 w-16 -rotate-12 bg-sun text-sun-foreground">
                        Best
                        <br />
                        seller
                      </span>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        to="/soaps/$slug"
                        params={{ slug: product.slug }}
                        className="font-display text-2xl leading-tight font-semibold hover:underline"
                      >
                        {product.name}
                      </Link>
                      <span className="price-tag shrink-0">${product.price.toFixed(2)}</span>
                    </div>
                    <p className="memo mt-2 text-muted-foreground">{product.note}</p>
                    <div className="min-h-5 flex-1" />
                    <button
                      className="secondary-button w-full"
                      onClick={() => addToCart(product.id)}
                    >
                      Add to bag <Plus size={16} />
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="ingredients" className="scroll-mt-24 px-5 py-20 sm:py-28 lg:px-10">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal className="relative mx-auto max-w-md">
            <div className="retro-frame">
              <img
                src={featured.images[2]?.src ?? featured.images[0]?.src}
                alt="Real Coconut Beach soap made with botanical ingredients"
                loading="lazy"
                width={1024}
                height={1024}
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <div className="seal absolute -right-6 -bottom-6">
              <Leaf size={22} />
              <span>GOOD FOR SKIN · GOOD FOR EARTH ·</span>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <p className="eyebrow">Nothing to hide</p>
            <h2 className="section-title max-w-2xl">
              What's inside the
              <br />
              <em>bottled sunshine.</em>
            </h2>
            <p className="mt-6 max-w-xl leading-7 text-muted-foreground">
              Every bar starts with a nourishing blend of coconut, olive, and sunflower oils. Then
              we add bright botanicals, beautiful scents, and absolutely no unnecessary stuff.
            </p>
            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {[
                { icon: Sparkles, title: "Coconut oil", text: "A rich, bubbly cleanse" },
                { icon: Leaf, title: "Botanicals", text: "Color from the earth" },
                { icon: Waves, title: "Ocean kind", text: "Plastic-free by nature" },
              ].map(({ icon: Icon, title, text }, index) => (
                <div key={title} className={`paper-card p-5 ${index === 1 ? "bg-sun" : ""}`}>
                  <Icon size={22} className="mb-4" />
                  <h3 className="font-display text-xl font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section
        id="story"
        className="scroll-mt-24 border-y-2 border-foreground bg-primary px-5 py-20 text-primary-foreground sm:py-28 lg:px-10"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className="eyebrow text-sun">Memo from management</p>
            <h2 className="slab-title">
              We opened a<br />
              soap company
              <br />
              instead.
            </h2>
          </Reveal>
          <Reveal delay={120} className="flex flex-col justify-end">
            <div className="paper-card bg-paper p-7 text-foreground">
              <p className="memo text-muted-foreground">Internal note · Natural Rituals Dept.</p>
              <p className="mt-5 text-lg leading-8">
                LOCKHABIT started with one stubborn idea: the things you use every single day should
                feel like a small holiday. So we make soap the slow way, in small batches, with
                color and scent that act like sunshine in a bar.
              </p>
              <p className="mt-6 font-display text-2xl italic">Beauty in a kinder routine.</p>
              <p className="memo mt-2 text-muted-foreground">— The Management</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="grain relative overflow-hidden bg-sun px-5 py-20 text-center text-sun-foreground sm:py-28">
        <div className="sunburst" />
        <Reveal className="relative mx-auto max-w-3xl">
          <p className="eyebrow text-sun-foreground">Postcards, not newsletters</p>
          <h2 className="slab-title">
            Send me
            <br />a postcard.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-7">
            New bars, sunny notes, and the occasional weather report from wherever we are. Roughly
            once a month.
          </p>
          <form
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              setPostcardSent(true);
            }}
          >
            <label className="sr-only" htmlFor="postcard-email">
              Email address
            </label>
            <input
              id="postcard-email"
              type="email"
              required
              placeholder="you@somewhere.warm"
              className="min-h-[3.3rem] flex-1 rounded-full border-2 border-foreground bg-paper px-5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button type="submit" className="dark-button justify-center">
              Sign me up <Send size={16} />
            </button>
          </form>
          <p className="memo mt-4" aria-live="polite">
            {postcardSent
              ? "Thanks! This signup is part of the demo — nothing was sent."
              : "Demo form · no emails are collected"}
          </p>
          <button onClick={scrollToShop} className="primary-button mt-10">
            Back to the catalog <ArrowRight size={18} />
          </button>
        </Reveal>
      </section>

      <footer className="border-t-2 border-foreground bg-foreground px-5 py-14 text-background lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <img
                src={logoTransparent}
                alt="LOCKHABIT Soap and Body Care"
                className="h-16 w-auto"
              />
              <p className="mt-3 text-sm text-background/65">Beauty in a kinder routine.</p>
            </div>
            <div>
              <p className="memo text-sun">Shop</p>
              <div className="mt-4 flex flex-col gap-2.5 text-sm text-background/75">
                <a href="#shop">Full catalog</a>
                <a href="#featured">Coconut Beach</a>
                <a href="#ingredients">Ingredients</a>
              </div>
            </div>
            <div>
              <p className="memo text-sun">The company</p>
              <div className="mt-4 flex flex-col gap-2.5 text-sm text-background/75">
                <Link to="/about">About us</Link>
                <a href="#desk">Front desk</a>
                <a href="#top">Lobby</a>
              </div>
            </div>
            <div>
              <p className="memo text-sun">Hours</p>
              <p className="mt-4 text-sm text-background/75">
                Open always.
                <br />
                Closed never.
                <br />
                Air 84°F, water 79°F.
              </p>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-2 border-t border-background/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="memo text-background/60">© 2026 LOCKHABIT Soap Co.</p>
            <p className="memo text-background/60">Checkout connection coming next</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
