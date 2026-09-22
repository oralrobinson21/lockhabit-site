import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowDown, Leaf, Plus, Sparkles, Waves } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { SiteHeader } from "@/components/site-header";
import { useCart } from "@/lib/cart";

import heroImage from "@/assets/lockhabit-hero.jpg";
import logoTransparent from "@/assets/lockhabit-logo-transparent.png";
import { products } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LOCKHABIT SOAP CO. | Permanent Vacation for Your Skin" },
      {
        name: "description",
        content:
          "LOCKHABIT Soap Co. — sun-soaked soap and body care, one concierge desk, and zero plans to go back to boring showers.",
      },
      { property: "og:title", content: "LOCKHABIT SOAP CO. | Permanent Vacation for Your Skin" },
      {
        property: "og:description",
        content:
          "Tropical soap and body care from the sunniest front desk in the business. Now open, always warm.",
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
    title: "The Gift Department",
    text: "Pick the right bar, add it to the bag, and take all the credit. We won’t tell.",
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
  const { addToCart, addBundle } = useCart();
  const [activeGalleryImage, setActiveGalleryImage] = useState(0);
  const featured = products[0]!;
  const featuredGallery = featured.images;

  const scrollToShop = () =>
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="overflow-x-hidden bg-background text-foreground">
      <SiteHeader />
      <section
        id="top"
        className="grain relative flex min-h-[86vh] items-end overflow-hidden text-hero-foreground"
      >
        <img
          src={heroImage}
          alt="LOCKHABIT botanical bar soap on wet tropical volcanic rock by the ocean"
          className="absolute inset-0 h-full w-full object-cover object-[68%_center]"
          fetchPriority="high"
        />
        <div className="hero-shade absolute inset-0" />
        <div className="fishing-lines" aria-hidden="true">
          <span />
          <span />
        </div>
        <button className="bundle-catch" onClick={() => scrollToShop()}>
          <span>THE BUNDLE CATCH</span>3 CHOSEN $89 · 6 CHOSEN $169
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
              Twelve soap and body-care essentials made for slow mornings, warm tile, and the kind of
              day where nothing is urgent. Check in whenever.
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
                "VACATION POWERED",
                "TOWEL INCLUDED (MENTALLY)",
                "VACATION POWERED",
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
            <p className="eyebrow">Room service pick</p>
            <h2 className="section-title">
              Coconut
              <br />
              <em>Beach Soap.</em>
            </h2>
            <div className="mt-6 flex items-center gap-4">
              <span className="sticker h-auto rotate-[-3deg] bg-coral px-3 py-1.5 text-coral-foreground">
                Front desk pick
              </span>
              <span className="price-tag">$35.00</span>
            </div>
            <p className="mt-7 max-w-lg text-base leading-7 text-muted-foreground">
              A creamy, sunlit cleanse inspired by slow mornings near the water. Coconut-rich lather
              leaves skin soft, fresh, and entirely unbothered by your calendar.
            </p>
            <ul className="mt-8 grid gap-3 border-y-2 border-foreground/15 py-6 text-sm font-bold sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <li className="flex items-center gap-2">
                <Leaf size={17} className="text-primary" /> PLANT-BASED OILS
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
              Pick any 3 bars for $89 or any 6 for $169. Buying a single bar on repeat? Monthly
              subscriptions save 15%.
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
                <p className="memo text-primary">3 chosen bars · $89</p>
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
              Every soap and body-care essential in the collection, from bright and citrusy to warm
              and deeply cozy. No wrong choices here.
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
                        Front
                        <br />
                        desk pick
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
                    <p className="memo mt-1 text-muted-foreground/75">{product.netWeight}</p>
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
              <span>GOOD HABITS · BRIGHTER DAYS ·</span>
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
              Formulas vary by bar. Across the collection you’ll find saponified oils, shea butter,
              botanicals, and scent blends chosen for each formula. The exact ingredient list lives
              on every product page — no mystery luggage.
            </p>
            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {[
                { icon: Sparkles, title: "Soap-making oils", text: "The exact blend varies by bar" },
                { icon: Leaf, title: "Botanicals", text: "Selected for each formula" },
                { icon: Waves, title: "Read the label", text: "Every product page lists what’s inside" },
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
                feel like a small holiday. So we built a collection around good formulas, bright
                color, and scent that acts like sunshine in a bar.
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
          <p className="eyebrow text-sun-foreground">The front desk is still open</p>
          <h2 className="slab-title">
            Need a
            <br />second opinion?
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-7">
            Choosing between three bars is a perfectly respectable use of your evening. Ask the
            front desk, or take another lap through the catalog. We support indecision.
          </p>
          <div className="mx-auto mt-8 flex max-w-lg flex-col justify-center gap-3 sm:flex-row">
            <Link to="/contact" className="dark-button justify-center">
              Ask the front desk <ArrowRight size={16} />
            </Link>
            <button onClick={scrollToShop} className="primary-button justify-center">
              Back to the catalog <ArrowRight size={18} />
            </button>
          </div>
          <p className="memo mt-4">Real humans · real support · no tiny lobby bell required</p>
        </Reveal>
      </section>

      <footer className="island-footer">
        <section className="island-footer-scene" aria-label="A sunny LockHabit island scene">
          <div className="island-footer-paper-noise" aria-hidden="true" />

          <svg className="island-palm island-palm-left" viewBox="0 0 280 360" aria-hidden="true">
            <path d="M74 360C91 276 102 196 118 102" fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
            <path d="M116 111C74 91 36 90 4 107C38 119 72 128 113 127Z" fill="currentColor" />
            <path d="M120 104C82 61 46 39 8 35C35 65 65 91 111 119Z" fill="currentColor" />
            <path d="M124 104C123 54 141 20 173 0C168 37 154 76 128 116Z" fill="currentColor" />
            <path d="M126 109C166 64 206 48 252 55C214 76 178 98 132 123Z" fill="currentColor" />
            <path d="M125 116C174 104 221 112 270 143C221 143 179 137 126 129Z" fill="currentColor" />
          </svg>

          <svg className="island-palm island-palm-right" viewBox="0 0 260 250" aria-hidden="true">
            <path d="M260 239C196 195 158 151 127 98" fill="none" stroke="currentColor" strokeWidth="15" strokeLinecap="round" />
            <path d="M127 101C94 77 60 67 19 72C51 91 83 104 124 114Z" fill="currentColor" />
            <path d="M128 96C102 60 78 35 42 17C61 50 83 76 122 108Z" fill="currentColor" />
            <path d="M132 94C137 52 155 22 185 3C180 38 164 68 137 105Z" fill="currentColor" />
            <path d="M136 100C174 72 209 64 248 72C214 88 181 101 139 113Z" fill="currentColor" />
          </svg>

          <div className="island-cloud island-cloud-one" aria-hidden="true"><i /><i /><i /></div>
          <div className="island-cloud island-cloud-two" aria-hidden="true"><i /><i /><i /></div>

          <div className="island-footer-copy">
            <p className="island-footer-script">Thanks for<br />being here <span>♡</span></p>
            <p className="island-footer-memo">SLOWER DAYS<br />BRIGHTER SKIN<br />A KINDER WORLD.</p>
          </div>

          <svg className="island-sun" viewBox="0 0 220 220" aria-label="Smiling sun">
            <g className="island-sun-rays" stroke="currentColor" strokeWidth="15" strokeLinecap="round">
              <path d="M110 8V34" /><path d="M110 186V212" /><path d="M8 110H34" /><path d="M186 110H212" />
              <path d="M38 38L57 57" /><path d="M163 163L182 182" /><path d="M182 38L163 57" /><path d="M57 163L38 182" />
            </g>
            <circle cx="110" cy="110" r="70" fill="currentColor" />
            <g fill="none" stroke="var(--foreground)" strokeWidth="7" strokeLinecap="round">
              <path d="M76 102c6 9 15 9 21 0" /><path d="M123 102c6 9 15 9 21 0" />
              <path d="M82 127c16 24 41 24 57 0" />
            </g>
          </svg>

          <p className="island-footer-sun-note">See you<br />in the sunshine ♡</p>

          <svg className="island-mountains" viewBox="0 0 1200 260" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 245L0 211L92 180L168 192L258 137L323 167L418 81L485 148L555 111L644 189L729 164L802 205L900 176L1000 203L1102 174L1200 209L1200 260Z" fill="currentColor" />
            <path d="M237 167L418 81L485 148L555 111L644 189L572 170L528 147L487 173L442 126L390 167L327 184Z" fill="var(--island-mountain-light)" opacity=".78" />
          </svg>

          <div className="island-boat" aria-label="A small LockHabit sailboat">
            <svg viewBox="0 0 180 190">
              <path d="M90 18V143" stroke="var(--foreground)" strokeWidth="5" />
              <path d="M86 30L86 137L24 137Z" fill="var(--paper)" stroke="var(--foreground)" strokeWidth="3" />
              <path d="M95 52L95 137L145 137Z" fill="var(--paper)" stroke="var(--foreground)" strokeWidth="3" />
              <path d="M25 142H154L135 170H47Z" fill="var(--sun)" stroke="var(--foreground)" strokeWidth="4" />
              <path d="M47 155H136" stroke="var(--foreground)" strokeWidth="3" />
            </svg>
          </div>

          <div className="island-waves" aria-hidden="true">
            <div className="island-wave island-wave-one">
              <svg viewBox="0 0 1500 180" preserveAspectRatio="none"><path d="M0 78C100 20 196 20 300 78S500 136 600 78S800 20 900 78S1100 136 1200 78S1400 20 1500 78V180H0Z" /></svg>
            </div>
            <div className="island-wave island-wave-two">
              <svg viewBox="0 0 1500 180" preserveAspectRatio="none"><path d="M0 76C125 132 225 132 340 76S560 20 680 76S900 132 1020 76S1240 20 1500 76V180H0Z" /></svg>
            </div>
            <div className="island-wave island-wave-three">
              <svg viewBox="0 0 1500 180" preserveAspectRatio="none"><path d="M0 78C100 20 196 20 300 78S500 136 600 78S800 20 900 78S1100 136 1200 78S1400 20 1500 78V180H0Z" /></svg>
            </div>
            <div className="island-wave island-wave-four">
              <svg viewBox="0 0 1500 180" preserveAspectRatio="none"><path d="M0 76C125 132 225 132 340 76S560 20 680 76S900 132 1020 76S1240 20 1500 76V180H0Z" /></svg>
            </div>
          </div>
        </section>

        <section className="island-footer-links">
          <div className="island-footer-grid">
            <div className="island-footer-brand">
              <img src={logoTransparent} alt="LOCKHABIT Soap and Body Care" />
              <p>Beauty in a kinder routine.</p>
            </div>
            <div>
              <p className="island-footer-heading">Shop</p>
              <div className="island-footer-list">
                <a href="#shop">Full catalog</a>
                <a href="#featured">Coconut Beach</a>
                <a href="#ingredients">Ingredients</a>
              </div>
            </div>
            <div>
              <p className="island-footer-heading">The company</p>
              <div className="island-footer-list">
                <Link to="/about">About us</Link>
                <Link to="/contact">Contact the front desk</Link>
                <Link to="/shipping">Shipping</Link>
                <Link to="/returns">Returns & refunds</Link>
              </div>
            </div>
            <div>
              <p className="island-footer-heading">Hours</p>
              <p className="island-footer-hours">
                Open always.<br />
                Closed never.<br />
                Air 84°F, water 79°F.
              </p>
              <div className="island-footer-list island-footer-legal">
                <a href="mailto:oralrobinson21@outlook.com">oralrobinson21@outlook.com</a>
                <Link to="/privacy">Privacy policy</Link>
                <Link to="/terms">Terms of service</Link>
              </div>
            </div>
          </div>
          <div className="island-footer-bottom">
            <p className="memo">LOCKHABIT SOAP CO. · EST. IN THE SUN</p>
            <p className="island-footer-script-small">More good days ahead. ♡</p>
          </div>
          <div className="island-footer-rule">
            <p className="memo">© 2026 LOCKHABIT Soap Co.</p>
            <p className="memo">Secure checkout powered by Stripe</p>
          </div>
        </section>
      </footer>
    </main>
  );
}
