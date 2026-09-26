import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bath,
  FlaskConical,
  Mail,
  Menu,
  Plane,
  Search,
  Sparkles,
  Sun,
  Waves,
  X,
} from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";

import logoTransparent from "@/assets/lockhabit-logo-transparent.png";

export const Route = createFileRoute("/media-prototype")({
  head: () => ({
    meta: [
      { title: "LOCKHABIT Resort Daily · Media Prototype" },
      { name: "robots", content: "noindex,nofollow,noarchive" },
      {
        name: "description",
        content:
          "A standalone LOCKHABIT editorial media prototype for wellness, body care, culture, and brighter days.",
      },
    ],
  }),
  component: MediaPrototype,
});

type Story = {
  slug: string;
  title: string;
  dek: string;
  category: string;
  author: "Maya" | "Chris" | "Jules";
  read: string;
  time: string;
  image: string;
  body: string[];
  lane?: "right" | "help" | "fun";
  expert?: boolean;
};

type Person = {
  name: "Maya" | "Chris" | "Jules";
  role: string;
  line: string;
  bio: string;
  image: string;
};

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=82`;

const stories: Story[] = [
  {
    slug: "everyone-is-showering-wrong",
    title: "Apparently Everyone Is Showering Wrong",
    dek: "We asked a skin expert what actually matters — and what the internet made up.",
    category: "Bathhouse",
    author: "Maya",
    read: "6 min",
    time: "12 min ago",
    image: img("1517840901100-8179e982acb7"),
    expert: true,
    lane: "right",
    body: [
      "The internet has turned showering into a competitive sport: elaborate routines, exact temperatures, complicated order-of-operations, and enough products to stock a hotel.",
      "The useful part is much less dramatic. Water that is comfortably warm, cleansing that does not leave skin feeling tight, and a routine you will actually repeat matter more than performing fourteen separate steps.",
      "The rest is preference. If eucalyptus makes your bathroom feel like a resort, wonderful. If a two-minute shower gets you out the door happy, also wonderful.",
      "Our rule at the Bathhouse is simple: keep the ritual enjoyable, keep the claims honest, and do not let your shower acquire a project manager.",
    ],
  },
  {
    slug: "dark-shower-seven-nights",
    title: "I Took a Shower in Complete Darkness for 7 Nights",
    dek: "A surprisingly calming experiment, plus one toe-related logistical problem.",
    category: "We Tried It",
    author: "Chris",
    read: "5 min",
    time: "28 min ago",
    image: img("1608248543803-ba4f8c70ae0b"),
    lane: "fun",
    body: [
      "The pitch sounded silly: lights off, phone outside, seven nights, no productivity goal attached.",
      "By night three the bathroom felt different — less like one more task and more like a hard stop at the end of the day.",
      "Nothing mystical happened. I did, however, stop mentally composing emails in the shower, which feels like a measurable improvement.",
      "Recommendation: dim is probably smarter than pitch black unless your bathroom layout is engraved in your memory.",
    ],
  },
  {
    slug: "magnesium-feet",
    title: "Why Is Everyone Suddenly Putting Magnesium on Their Feet?",
    dek: "The trend is everywhere. We separated what people enjoy from what is actually established.",
    category: "Ingredient Desk",
    author: "Maya",
    read: "7 min",
    time: "41 min ago",
    image: img("1556228720-195a672e8a03"),
    expert: true,
    lane: "right",
    body: [
      "Wellness trends tend to travel faster than evidence. Magnesium foot sprays are a good example: lots of enthusiastic anecdotes, lots of confident captions, and much less certainty than the posts imply.",
      "A product can still be pleasant to use without needing an oversized health claim attached to it.",
      "That distinction matters here. We can talk about texture, scent, ritual, and how something feels without pretending every bathroom habit is medicine.",
    ],
  },
  {
    slug: "five-minute-reset",
    title: "The 5-Minute Reset We Keep Coming Back To",
    dek: "No ice bath. No sunrise alarm. Just one small ritual that makes evenings feel less chaotic.",
    category: "Sleep Desk",
    author: "Jules",
    read: "4 min",
    time: "1 hr ago",
    image: img("1519415387722-a1c3bbef716c"),
    lane: "help",
    body: [
      "This is aggressively simple: put the phone down, wash your face or shower, reset one tiny part of your space, and call the day over.",
      "The point is not optimization. It is creating a visible border between whatever happened today and the part of the evening that belongs to you.",
    ],
  },
  {
    slug: "cold-shower-seven-days",
    title: "I Showered Cold for 7 Days. Here's the Part Nobody Mentions.",
    dek: "Day one was dramatic. Day four was annoying. Day seven was… complicated.",
    category: "We Tried It",
    author: "Chris",
    read: "8 min",
    time: "2 hrs ago",
    image: img("1531353826977-0941b4779a1c"),
    lane: "fun",
    body: [
      "Cold showers have exceptional marketing. They are framed as discipline, transformation, alertness, and occasionally proof of character.",
      "The first thirty seconds are indeed very awake. The part nobody mentions is that novelty fades quickly and then you are simply a person standing under cold water because past-you made a content decision.",
      "I liked the clean mental break. I did not unlock a new personality. Your mileage, and your water heater, may vary.",
    ],
  },
  {
    slug: "clean-vs-stripped",
    title: "The Difference Between Clean and Stripped Skin",
    dek: "That squeaky feeling is not always the victory signal people think it is.",
    category: "Bathhouse",
    author: "Maya",
    read: "6 min",
    time: "3 hrs ago",
    image: img("1596755094514-f87e34085b2c"),
    expert: true,
    lane: "help",
    body: [
      "People often describe extremely tight post-shower skin as extra clean. Those are not necessarily the same thing.",
      "A cleanser can remove sweat, oils, and grime without making your skin feel like shrink wrap.",
      "Pay attention to comfort after rinsing, not just how aggressively the product announces itself while you use it.",
    ],
  },
  {
    slug: "fourteen-steps",
    title: "Your Shower Does Not Need 14 Steps",
    dek: "A practical case for fewer products and a routine you actually enjoy.",
    category: "Bathhouse",
    author: "Maya",
    read: "5 min",
    time: "4 hrs ago",
    image: img("1583417319070-4a69db38a482"),
    lane: "help",
    body: [
      "There is nothing wrong with an elaborate routine if it genuinely makes you happy.",
      "But if the ritual starts to feel like homework, subtraction is allowed.",
      "Pick the few things that create the biggest sensory or practical difference and let the rest audition for their place.",
    ],
  },
  {
    slug: "soap-in-winter",
    title: "Why Your Soap Feels Different in Winter",
    dek: "Humidity changes, hot water habits, and why the same routine can suddenly feel off.",
    category: "Ingredients",
    author: "Maya",
    read: "6 min",
    time: "5 hrs ago",
    image: img("1580489944761-15a19d654956"),
    expert: true,
    lane: "help",
    body: [
      "Season changes can change how your skin feels even when your products do not.",
      "Indoor heating, lower humidity, and longer hot showers all shift the experience.",
      "It can be useful to adjust water temperature, frequency, or what you use afterward before declaring that a product has suddenly stopped working.",
    ],
  },
  {
    slug: "hotel-bathroom-energy",
    title: "How to Give Your Bathroom Hotel Energy Without Remodeling Anything",
    dek: "Five cheap changes, zero marble slabs, and one rule about towels.",
    category: "Travel Brain",
    author: "Jules",
    read: "5 min",
    time: "Yesterday",
    image: img("1506794778202-cad84cf45f1d"),
    lane: "fun",
    body: [
      "The best hotel bathrooms are mostly choreography: light, scent, towels, emptiness, and one or two beautiful objects.",
      "You do not need a renovation. You need less visual clutter, better lighting, a towel you actually like, and one scent that belongs to the room.",
    ],
  },
];

const people: Person[] = [
  {
    name: "Maya",
    role: "Skin & Ingredients",
    line: "Will read an ingredient label for fun.",
    bio: "Maya covers formulas, ingredient claims, body care, and the difference between useful information and wellness theater.",
    image: img("1494790108377-be9c29b29330", 700),
  },
  {
    name: "Chris",
    role: "Wellness Experiments",
    line: "Will apparently try anything once.",
    bio: "Chris tests routines, trends, questionable challenges, and internet wellness ideas so everyone else can watch safely from the pool chair.",
    image: img("1500648767791-00dcc994a43e", 700),
  },
  {
    name: "Jules",
    role: "Travel & Good Living",
    line: "Professionally avoids bad vacations.",
    bio: "Jules covers small luxuries, travel habits, sleep rituals, home upgrades, and anything that makes Tuesday feel 12% more like vacation.",
    image: img("1524504388940-b1c1722653e1", 700),
  },
];

const trending = [
  ["1", "The everything shower has officially gotten out of hand", "up 42% today"],
  ["2", "People keep sending us this magnesium foot thing", "most shared"],
  ["3", "The bath towel rule everyone has an opinion about", "comments exploding"],
  ["4", "Do shower filters actually change anything?", "searching fast"],
  ["5", "Why hotel soap always smells like vacation", "new entry"],
];

const picks = [
  ["The giant waffle robe", "Looks like room service feels.", img("1547425260-76bcadfb4f2c", 650)],
  ["A towel worth hanging up", "Thick enough to feel unnecessary.", img("1616394584738-fc6e612e71b9", 650)],
  ["Tiny shower speaker", "For aggressively unserious mornings.", img("1522335789203-aabd1fc54bc9", 650)],
  ["The bedside paperback", "No notifications. Huge feature.", img("1584622650111-993a426fbf0a", 650)],
  ["Candle with vacation energy", "Smells like the lobby has a pool.", img("1598300042247-d088f8ab3a91", 650)],
  ["The travel pouch", "Stops your bag becoming soup.", img("1602143407151-7111542de6e8", 650)],
];

function MediaPrototype() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [vote, setVote] = useState<"yes" | "no" | null>(null);
  const [mail, setMail] = useState("");
  const [mailDone, setMailDone] = useState(false);
  const [ask, setAsk] = useState("");
  const [askDone, setAskDone] = useState(false);

  const filteredStories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stories;
    return stories.filter((story) =>
      [story.title, story.dek, story.category, story.author].some((part) =>
        part.toLowerCase().includes(q),
      ),
    );
  }, [query]);

  const openStory = (story: Story) => {
    setSelectedStory(story);
    setSearchOpen(false);
  };

  const newsletterSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!mail.trim()) return;
    setMailDone(true);
  };

  const askSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!ask.trim()) return;
    setAskDone(true);
  };

  const lane = (kind: "right" | "help" | "fun") => stories.filter((s) => s.lane === kind).slice(0, 3);

  return (
    <main className="lhm">
      <style>{mediaStyles}</style>

      <header className="lhm-header">
        <Link to="/" className="lhm-brand" aria-label="Back to LockHabit storefront">
          <img src={logoTransparent} alt="LOCKHABIT" />
          <span>RESORT DAILY</span>
        </Link>

        <nav className="lhm-nav" aria-label="Media sections">
          <a href="#latest">Latest</a>
          <a href="#bathhouse">Bathhouse</a>
          <a href="#sleep">Sleep Desk</a>
          <a href="#ingredients">Ingredients</a>
          <a href="#tried">We Tried It</a>
          <a href="#good-stuff">Good Stuff</a>
          <a href="#travel">Travel Brain</a>
        </nav>

        <div className="lhm-header-actions">
          <button className="lhm-icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search stories">
            <Search size={19} />
          </button>
          <a href="#morning-shower" className="lhm-checkin">
            CHECK IN
          </a>
          <button
            className="lhm-menu"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {menuOpen && (
          <div className="lhm-mobile-nav">
            {[
              ["Latest", "#latest"],
              ["Bathhouse", "#bathhouse"],
              ["Sleep Desk", "#sleep"],
              ["Ingredients", "#ingredients"],
              ["We Tried It", "#tried"],
              ["Good Stuff", "#good-stuff"],
              ["Travel Brain", "#travel"],
              ["The Morning Shower", "#morning-shower"],
            ].map(([label, href]) => (
              <a key={label} href={href} onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ))}
          </div>
        )}
      </header>

      <div className="lhm-ticker" aria-label="Latest resort updates">
        <div>
          <span>GOOD MORNING FROM THE RESORT ☀</span>
          <span>NEW: THE EVERYTHING SHOWER HAS OFFICIALLY GOTTEN OUT OF HAND</span>
          <span>87% OF GUESTS WOULD TRY THIS</span>
          <span>LATEST DISPATCH · 12 MIN AGO</span>
          <span>GOOD MORNING FROM THE RESORT ☀</span>
          <span>NEW: THE EVERYTHING SHOWER HAS OFFICIALLY GOTTEN OUT OF HAND</span>
          <span>87% OF GUESTS WOULD TRY THIS</span>
          <span>LATEST DISPATCH · 12 MIN AGO</span>
        </div>
      </div>

      <section className="lhm-hero">
        <div className="lhm-kicker">WHAT EVERYONE'S TALKING ABOUT</div>
        <div className="lhm-hero-grid">
          <button className="lhm-feature" onClick={() => openStory(stories[0])}>
            <div className="lhm-photo-frame">
              <img src={stories[0].image} alt="Bright shower scene" />
              <span className="lhm-note">we have questions →</span>
            </div>
            <div className="lhm-feature-copy">
              <h1>{stories[0].title}</h1>
              <p>{stories[0].dek}</p>
              <div className="lhm-meta">
                BY MAYA · {stories[0].read} · EXPERT CHECKED
              </div>
            </div>
          </button>

          <div className="lhm-side-stories">
            {stories.slice(1, 4).map((story, index) => (
              <button key={story.slug} className={`lhm-side-story side-${index + 1}`} onClick={() => openStory(story)}>
                <img src={story.image} alt="" />
                <div>
                  <span>{story.category}</span>
                  <h2>{story.title}</h2>
                  <small>
                    {story.author} · {story.read}
                  </small>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="lhm-trending">
        <div className="lhm-section-title">
          <div>
            <span className="lhm-kicker">LIVE DESK</span>
            <h2>WHAT'S BLOWING UP</h2>
          </div>
          <span className="lhm-hand">people keep sending us these ↘</span>
        </div>
        <div className="lhm-trending-list">
          {trending.map(([number, title, signal]) => (
            <div key={number} className="lhm-trend-row">
              <span className="lhm-rank">{number}</span>
              <span className="lhm-trend-title">{title}</span>
              <span className="lhm-signal">{signal}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="lhm-lanes">
        <Lane
          title="RIGHT NOW"
          subtitle="Trends, quick takes, things everyone suddenly has an opinion about."
          icon={<Sun size={22} />}
          stories={lane("right")}
          tone="coral"
          openStory={openStory}
        />
        <Lane
          title="HELP ME"
          subtitle="Useful stuff you can search at 11:42 PM without being judged."
          icon={<Bath size={22} />}
          stories={lane("help")}
          tone="aqua"
          openStory={openStory}
        />
        <Lane
          title="ENTERTAIN ME"
          subtitle="Experiments, tiny obsessions, and wellness ideas with personality."
          icon={<Sparkles size={22} />}
          stories={lane("fun")}
          tone="sun"
          openStory={openStory}
        />
      </section>

      <section id="tried" className="lhm-tried">
        <div className="lhm-tried-head">
          <span className="lhm-stamp">RECURRING SERIES</span>
          <h2>WE TRIED IT</h2>
          <p>We tried it so your bathroom didn't have to.</p>
        </div>
        <div className="lhm-tried-grid">
          <button className="lhm-tried-story" onClick={() => openStory(stories[4])}>
            <img src={stories[4].image} alt="Cold shower experiment" />
            <div>
              <span>WELLNESS EXPERIMENT · DAY 7</span>
              <h3>{stories[4].title}</h3>
              <p>{stories[4].dek}</p>
            </div>
          </button>

          <div className="lhm-poll">
            <span className="lhm-kicker">GUEST POLL</span>
            <h3>Would you try it?</h3>
            <p>Seven days. Cold water. No negotiating with yourself.</p>
            {!vote ? (
              <div className="lhm-poll-buttons">
                <button onClick={() => setVote("yes")}>TRY IT</button>
                <button onClick={() => setVote("no")}>ABSOLUTELY NOT</button>
              </div>
            ) : (
              <div className="lhm-results" aria-live="polite">
                <div>
                  <span>TRY IT</span>
                  <strong>{vote === "yes" ? "69%" : "68%"}</strong>
                </div>
                <div className="lhm-bar">
                  <i style={{ width: vote === "yes" ? "69%" : "68%" }} />
                </div>
                <div>
                  <span>ABSOLUTELY NOT</span>
                  <strong>{vote === "yes" ? "31%" : "32%"}</strong>
                </div>
                <div className="lhm-bar lhm-bar-alt">
                  <i style={{ width: vote === "yes" ? "31%" : "32%" }} />
                </div>
                <small>Your extremely scientific resort opinion has been recorded locally.</small>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="bathhouse" className="lhm-bathhouse">
        <div className="lhm-section-title">
          <div>
            <span className="lhm-kicker">THE STANDING DESK OF THE RESORT</span>
            <h2>FROM THE BATHHOUSE</h2>
          </div>
          <span className="lhm-hand">no miracle claims allowed →</span>
        </div>
        <div className="lhm-bath-grid">
          {stories.slice(5, 8).map((story) => (
            <button key={story.slug} onClick={() => openStory(story)} className="lhm-bath-card">
              <img src={story.image} alt="" />
              <span>{story.category}</span>
              <h3>{story.title}</h3>
              <p>{story.dek}</p>
              <div>
                {story.expert ? "EXPERT CHECKED · " : ""}
                {story.author} · {story.read}
              </div>
            </button>
          ))}
        </div>
        <p className="lhm-bath-quote">Your shower does not need a project manager.</p>
      </section>

      <section className="lhm-people">
        <div className="lhm-section-title">
          <div>
            <span className="lhm-kicker">THE HUMANS BEHIND THE DESK</span>
            <h2>MEET THE PEOPLE AT THE RESORT</h2>
          </div>
          <span className="lhm-hand">staff photos, suspiciously sunny ↘</span>
        </div>
        <div className="lhm-people-grid">
          {people.map((person, index) => (
            <button key={person.name} className={`lhm-person person-${index + 1}`} onClick={() => setSelectedPerson(person)}>
              <div className="lhm-polaroid">
                <span className="lhm-tape" />
                <img src={person.image} alt={person.name} />
                <strong>{person.name}</strong>
                <small>{person.role}</small>
              </div>
              <p>“{person.line}”</p>
              <span>MEET {person.name.toUpperCase()} →</span>
            </button>
          ))}
        </div>
      </section>

      <section className="lhm-ask">
        <div className="lhm-ask-copy">
          <span className="lhm-kicker">ASK LOCKHABIT</span>
          <h2>What's one wellness habit everyone swears by that did absolutely nothing for you?</h2>
          <p>Answers may appear in a future issue. Be funny, be honest, be brief.</p>
          <form onSubmit={askSubmit}>
            <textarea
              value={ask}
              onChange={(event) => {
                setAsk(event.target.value);
                setAskDone(false);
              }}
              placeholder="Mine was waking up at 5 AM. I was simply tired earlier."
              rows={4}
            />
            <button type="submit">SEND IT TO THE DESK</button>
            {askDone && <span className="lhm-success">Filed at the front desk. Thank you ☀</span>}
          </form>
        </div>
        <div className="lhm-answers">
          <article>
            <p>“Celery juice. Twelve days. My greatest achievement was buying celery.”</p>
            <span>— SAM, QUEENS</span>
          </article>
          <article>
            <p>“Cold plunges. I remain the exact same person, but colder.”</p>
            <span>— TAYLOR, BROOKLYN</span>
          </article>
          <article>
            <p>“A sunrise alarm clock. Turns out I dislike fake sun too.”</p>
            <span>— NIA, CHICAGO</span>
          </article>
        </div>
      </section>

      <section id="good-stuff" className="lhm-good-stuff">
        <div className="lhm-section-title">
          <div>
            <span className="lhm-kicker">EDITOR PICKS · PROTOTYPE ONLY</span>
            <h2>GOOD STUFF WE FOUND</h2>
          </div>
          <span className="lhm-hand">not everything needs to be soap →</span>
        </div>
        <div className="lhm-picks">
          {picks.map(([name, note, image], index) => (
            <article key={name} className={index % 2 ? "lhm-pick offset" : "lhm-pick"}>
              <img src={image} alt="" />
              <h3>{name}</h3>
              <p>{note}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="morning-shower" className="lhm-newsletter">
        <div className="lhm-newsletter-card">
          <div>
            <span className="lhm-kicker">THE MORNING SHOWER</span>
            <h2>Five minutes of useful nonsense for a better day.</h2>
            <p>Not a coupon email wearing sunglasses. A tiny media product you might actually open.</p>
          </div>
          <ul>
            <li>☀ one thing worth knowing</li>
            <li>🧼 one body / skin tip</li>
            <li>🌿 one ingredient we're investigating</li>
            <li>😂 one ridiculous thing from the internet</li>
            <li>🏖 one thing that'll improve your day</li>
          </ul>
          <form onSubmit={newsletterSubmit}>
            <Mail size={18} />
            <input
              type="email"
              required
              value={mail}
              onChange={(event) => {
                setMail(event.target.value);
                setMailDone(false);
              }}
              placeholder="you@example.com"
              aria-label="Email address"
            />
            <button type="submit">CHECK IN</button>
          </form>
          {mailDone && <div className="lhm-success">You're on the guest list. Prototype signup only.</div>}
        </div>
      </section>

      <section id="latest" className="lhm-latest">
        <div className="lhm-section-title">
          <div>
            <span className="lhm-kicker">REVERSE CHRONOLOGICAL · LIKE THE INTERNET USED TO BE</span>
            <h2>LATEST FROM THE RESORT</h2>
          </div>
        </div>
        <div className="lhm-latest-list">
          {stories.slice(0, 8).map((story) => (
            <button key={story.slug} onClick={() => openStory(story)} className="lhm-latest-row">
              <span className="lhm-latest-time">{story.time}</span>
              <img src={story.image} alt="" />
              <div>
                <span>
                  {story.category} · {story.author}
                </span>
                <h3>{story.title}</h3>
                <p>{story.dek}</p>
              </div>
              <ArrowRight size={21} />
            </button>
          ))}
        </div>
      </section>

      <section id="travel" className="lhm-travel-strip">
        <div>
          <Plane size={28} />
          <span>TRAVEL BRAIN</span>
        </div>
        <button onClick={() => openStory(stories[8])}>
          <h2>{stories[8].title}</h2>
          <p>{stories[8].dek}</p>
          <span>READ THE DISPATCH →</span>
        </button>
      </section>

      <section className="lhm-soap-bridge">
        <div className="lhm-soap-image">
          <img src={img("1570172619644-dfd03ed5d881", 1100)} alt="Colorful spa scene with soap and botanicals" />
          <span>small escape, normal Tuesday</span>
        </div>
        <div className="lhm-soap-copy">
          <span className="lhm-kicker">FROM THE GIFT SHOP</span>
          <h2>SOAP THAT TAKES YOU THERE</h2>
          <p>
            The media can earn your attention first. The product only shows up when it belongs.
            Better showers, plant-based bars, and a little resort energy for the room you already have.
          </p>
          <div>
            <Link to="/" className="lhm-primary-link">
              VISIT THE GIFT SHOP <ArrowRight size={16} />
            </Link>
            <button onClick={() => openStory(stories[0])} className="lhm-secondary-link">
              WHY THE RITUAL MATTERS
            </button>
          </div>
        </div>
      </section>

      <footer className="lhm-footer">
        <div className="lhm-footer-brand">
          <img src={logoTransparent} alt="LOCKHABIT" />
          <span>GOOD HABITS. BRIGHTER DAYS.</span>
        </div>
        <div className="lhm-footer-cols">
          <div>
            <strong>RESORT DESK</strong>
            <a href="#latest">Latest</a>
            <a href="#bathhouse">Bathhouse</a>
            <a href="#tried">We Tried It</a>
          </div>
          <div>
            <strong>GOOD LIVING</strong>
            <a href="#good-stuff">Good Stuff</a>
            <a href="#travel">Travel Brain</a>
            <a href="#morning-shower">Morning Shower</a>
          </div>
          <div>
            <strong>LOCKHABIT</strong>
            <Link to="/">Gift Shop</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
        <div className="lhm-footer-wave">
          <Waves size={26} />
          <span>Prototype branch · production untouched</span>
        </div>
      </footer>

      {searchOpen && (
        <div className="lhm-overlay" role="dialog" aria-modal="true" aria-label="Search the Resort Daily">
          <div className="lhm-search-modal">
            <button className="lhm-modal-close" onClick={() => setSearchOpen(false)} aria-label="Close search">
              <X size={22} />
            </button>
            <span className="lhm-kicker">SEARCH THE RESORT</span>
            <h2>What are you looking for?</h2>
            <div className="lhm-search-box">
              <Search size={19} />
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try shower, sleep, ingredients…" />
            </div>
            <div className="lhm-search-results">
              {filteredStories.slice(0, 6).map((story) => (
                <button key={story.slug} onClick={() => openStory(story)}>
                  <img src={story.image} alt="" />
                  <span>
                    <small>{story.category}</small>
                    <strong>{story.title}</strong>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedStory && (
        <div className="lhm-overlay story-overlay" role="dialog" aria-modal="true" aria-label={selectedStory.title}>
          <article className="lhm-story-modal">
            <button className="lhm-modal-close" onClick={() => setSelectedStory(null)} aria-label="Close article">
              <X size={22} />
            </button>
            <span className="lhm-kicker">{selectedStory.category}</span>
            <h2>{selectedStory.title}</h2>
            <p className="lhm-story-dek">{selectedStory.dek}</p>
            <div className="lhm-story-byline">
              BY {selectedStory.author.toUpperCase()} · {selectedStory.read}
              {selectedStory.expert ? " · EXPERT CHECKED" : ""}
            </div>
            <img src={selectedStory.image} alt="" className="lhm-story-hero" />
            <div className="lhm-story-body">
              {selectedStory.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <blockquote>Good advice. Questionable experiments. Better showers.</blockquote>
              <p className="lhm-story-note">
                Prototype editorial only. Health-related topics should be sourced, carefully reviewed, and kept separate from medical diagnosis or treatment claims.
              </p>
            </div>
          </article>
        </div>
      )}

      {selectedPerson && (
        <div className="lhm-overlay" role="dialog" aria-modal="true" aria-label={selectedPerson.name}>
          <div className="lhm-person-modal">
            <button className="lhm-modal-close" onClick={() => setSelectedPerson(null)} aria-label="Close profile">
              <X size={22} />
            </button>
            <img src={selectedPerson.image} alt={selectedPerson.name} />
            <div>
              <span className="lhm-kicker">{selectedPerson.role}</span>
              <h2>{selectedPerson.name}</h2>
              <p className="lhm-person-line">“{selectedPerson.line}”</p>
              <p>{selectedPerson.bio}</p>
              <h3>Latest from {selectedPerson.name}</h3>
              {stories
                .filter((story) => story.author === selectedPerson.name)
                .slice(0, 3)
                .map((story) => (
                  <button
                    key={story.slug}
                    onClick={() => {
                      setSelectedPerson(null);
                      openStory(story);
                    }}
                  >
                    {story.title} <ArrowRight size={15} />
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Lane({
  title,
  subtitle,
  icon,
  stories: laneStories,
  tone,
  openStory,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  stories: Story[];
  tone: "coral" | "aqua" | "sun";
  openStory: (story: Story) => void;
}) {
  return (
    <section className={`lhm-lane tone-${tone}`}>
      <div className="lhm-lane-head">
        <span>{icon}</span>
        <h2>{title}</h2>
      </div>
      <p>{subtitle}</p>
      <div className="lhm-lane-stories">
        {laneStories.map((story) => (
          <button key={story.slug} onClick={() => openStory(story)}>
            <span>{story.category}</span>
            <strong>{story.title}</strong>
            <small>
              {story.author} · {story.read}
            </small>
          </button>
        ))}
      </div>
    </section>
  );
}

const mediaStyles = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,800&display=swap');

.lhm{
  --cream:#f6edd7;
  --paper:#fffaf0;
  --ink:#20251f;
  --coral:#ff5c4d;
  --coral-dark:#c93f34;
  --aqua:#a7e4df;
  --aqua-dark:#328f8c;
  --sun:#f5cd4d;
  --muted:#6d6b62;
  min-height:100vh;
  background:
    radial-gradient(circle at 15% 18%, rgba(255,255,255,.55), transparent 26%),
    linear-gradient(rgba(80,60,20,.035) 1px, transparent 1px),
    var(--cream);
  background-size:auto, 100% 7px, auto;
  color:var(--ink);
  font-family:"DM Sans",system-ui,sans-serif;
}
.lhm *{box-sizing:border-box}
.lhm button,.lhm input,.lhm textarea{font:inherit}
.lhm button{color:inherit}
.lhm a{color:inherit}
.lhm h1,.lhm h2,.lhm h3{font-family:"Fraunces",Georgia,serif;letter-spacing:-.025em}
.lhm img{display:block}
.lhm button:focus-visible,.lhm a:focus-visible,.lhm input:focus-visible,.lhm textarea:focus-visible{outline:3px solid var(--coral);outline-offset:3px}

.lhm-header{
  position:sticky;top:0;z-index:50;
  height:76px;padding:0 clamp(16px,3vw,42px);
  display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:28px;
  background:rgba(255,250,240,.94);backdrop-filter:blur(12px);
  border-bottom:2px solid var(--ink);
}
.lhm-brand{display:flex;align-items:center;gap:10px;text-decoration:none}
.lhm-brand img{width:142px;height:52px;object-fit:contain;mix-blend-mode:multiply}
.lhm-brand span{font-size:10px;letter-spacing:.18em;font-weight:800;border-left:1px solid var(--ink);padding-left:10px;line-height:1.2}
.lhm-nav{display:flex;justify-content:center;gap:clamp(12px,1.7vw,27px);font-size:13px;font-weight:700}
.lhm-nav a{text-decoration:none;border-bottom:2px solid transparent;padding:8px 0}
.lhm-nav a:hover{border-color:var(--coral)}
.lhm-header-actions{display:flex;align-items:center;gap:8px}
.lhm-icon-btn,.lhm-menu{border:0;background:transparent;width:40px;height:40px;display:grid;place-items:center;cursor:pointer}
.lhm-checkin{background:var(--coral);color:white;text-decoration:none;font-size:11px;font-weight:900;letter-spacing:.12em;padding:12px 16px;border:2px solid var(--ink);box-shadow:3px 3px 0 var(--ink)}
.lhm-menu{display:none}
.lhm-mobile-nav{position:absolute;top:76px;left:0;right:0;background:var(--paper);border-bottom:2px solid var(--ink);padding:18px 22px;display:grid;gap:10px}
.lhm-mobile-nav a{text-decoration:none;font-weight:800;font-size:18px}

.lhm-ticker{overflow:hidden;background:var(--sun);border-bottom:2px solid var(--ink);white-space:nowrap}
.lhm-ticker>div{display:inline-flex;min-width:max-content;animation:lhmMarquee 34s linear infinite}
.lhm-ticker span{font-size:11px;font-weight:900;letter-spacing:.15em;padding:10px 35px;border-right:1px solid var(--ink)}
@keyframes lhmMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}

.lhm-kicker{font-size:11px;font-weight:900;letter-spacing:.17em;text-transform:uppercase}
.lhm-hand{font-family:"Caveat",cursive;font-size:25px;color:var(--coral-dark);transform:rotate(-3deg);display:inline-block}
.lhm-hero,.lhm-trending,.lhm-bathhouse,.lhm-good-stuff,.lhm-latest{max-width:1420px;margin:0 auto;padding-left:clamp(16px,3.2vw,46px);padding-right:clamp(16px,3.2vw,46px)}
.lhm-hero{padding-top:42px;padding-bottom:65px}
.lhm-hero>.lhm-kicker{margin-bottom:16px;color:var(--coral-dark)}
.lhm-hero-grid{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(340px,.85fr);gap:22px;align-items:start}
.lhm-feature{border:0;background:transparent;text-align:left;padding:0;cursor:pointer}
.lhm-photo-frame{position:relative;padding:8px;background:var(--paper);border:2px solid var(--ink);box-shadow:7px 7px 0 var(--ink);transform:rotate(-.35deg)}
.lhm-photo-frame img{width:100%;height:min(52vw,625px);object-fit:cover}
.lhm-note{position:absolute;right:5%;bottom:5%;font-family:"Caveat",cursive;font-size:30px;color:white;text-shadow:0 2px 10px rgba(0,0,0,.35);transform:rotate(-5deg)}
.lhm-feature-copy{padding:25px 10px 0}
.lhm-feature h1{font-size:clamp(44px,6vw,90px);line-height:.9;margin:0;max-width:980px}
.lhm-feature p{font-family:"Fraunces",serif;font-size:clamp(18px,2vw,26px);max-width:780px;line-height:1.35;margin:18px 0}
.lhm-meta{font-size:11px;font-weight:900;letter-spacing:.12em}
.lhm-side-stories{display:grid;gap:19px}
.lhm-side-story{display:grid;grid-template-columns:132px 1fr;gap:14px;width:100%;border:0;background:transparent;padding:0 0 18px;text-align:left;border-bottom:1px solid rgba(32,37,31,.35);cursor:pointer}
.lhm-side-story img{width:132px;height:118px;object-fit:cover;border:2px solid var(--ink)}
.lhm-side-story span,.lhm-bath-card>span{font-size:10px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:var(--coral-dark)}
.lhm-side-story h2{font-size:22px;line-height:1.02;margin:5px 0 9px}
.lhm-side-story small{font-size:11px;font-weight:700;color:var(--muted)}
.lhm-side-story:hover h2{color:var(--coral-dark)}

.lhm-section-title{display:flex;justify-content:space-between;gap:30px;align-items:end;margin-bottom:30px}
.lhm-section-title h2{font-size:clamp(34px,4.5vw,63px);line-height:.95;margin:6px 0 0}
.lhm-trending{padding-bottom:75px}
.lhm-trending-list{border-top:2px solid var(--ink)}
.lhm-trend-row{display:grid;grid-template-columns:65px 1fr auto;gap:18px;align-items:center;padding:18px 6px;border-bottom:1px solid rgba(32,37,31,.38)}
.lhm-rank{font-family:"Fraunces",serif;font-size:40px;font-weight:800;color:var(--coral)}
.lhm-trend-title{font-family:"Fraunces",serif;font-size:clamp(18px,2.1vw,29px);font-weight:700}
.lhm-signal{font-size:10px;font-weight:900;letter-spacing:.13em;text-transform:uppercase;background:var(--aqua);padding:7px 10px;border:1px solid var(--ink)}

.lhm-lanes{max-width:1420px;margin:0 auto;padding:0 clamp(16px,3.2vw,46px) 90px;display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.lhm-lane{padding:24px;border:2px solid var(--ink);box-shadow:5px 5px 0 var(--ink);position:relative}
.lhm-lane.tone-coral{background:#ffd8d0;transform:rotate(-.5deg)}
.lhm-lane.tone-aqua{background:#cef2ef;transform:rotate(.4deg)}
.lhm-lane.tone-sun{background:#f9e7a1;transform:rotate(-.25deg)}
.lhm-lane-head{display:flex;align-items:center;gap:9px}
.lhm-lane-head h2{font-size:34px;margin:0}
.lhm-lane>p{min-height:46px;color:#4b4d46;font-size:14px;line-height:1.5}
.lhm-lane-stories{display:grid;gap:0;border-top:2px solid var(--ink);margin-top:20px}
.lhm-lane-stories button{border:0;background:transparent;text-align:left;padding:16px 0;border-bottom:1px solid rgba(32,37,31,.4);cursor:pointer}
.lhm-lane-stories button>span{font-size:9px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}
.lhm-lane-stories strong{font-family:"Fraunces",serif;display:block;font-size:18px;line-height:1.1;margin:4px 0 7px}
.lhm-lane-stories small{font-size:10px;color:var(--muted)}

.lhm-tried{background:var(--coral);color:white;border-block:3px solid var(--ink);padding:65px clamp(16px,4vw,60px);position:relative;overflow:hidden}
.lhm-tried:after{content:"☀";position:absolute;right:-35px;top:-80px;font-size:240px;color:rgba(255,255,255,.12)}
.lhm-tried-head{max-width:1420px;margin:0 auto 32px}
.lhm-stamp{display:inline-block;border:2px solid white;border-radius:999px;padding:7px 11px;font-size:10px;font-weight:900;letter-spacing:.15em;transform:rotate(-2deg)}
.lhm-tried-head h2{font-size:clamp(60px,10vw,138px);line-height:.82;margin:18px 0 5px}
.lhm-tried-head p{font-family:"Caveat",cursive;font-size:30px;margin:0}
.lhm-tried-grid{max-width:1420px;margin:0 auto;display:grid;grid-template-columns:1.5fr .7fr;gap:35px;align-items:start}
.lhm-tried-story{border:0;background:var(--paper);color:var(--ink);padding:10px;text-align:left;cursor:pointer;box-shadow:8px 8px 0 var(--ink)}
.lhm-tried-story img{width:100%;height:420px;object-fit:cover}
.lhm-tried-story div{padding:22px 15px 18px}
.lhm-tried-story span,.lhm-poll>.lhm-kicker{font-size:10px;font-weight:900;letter-spacing:.14em}
.lhm-tried-story h3{font-size:clamp(30px,4vw,55px);line-height:.96;margin:8px 0}
.lhm-tried-story p{font-size:15px;line-height:1.5;color:#57594f}
.lhm-poll{background:var(--paper);color:var(--ink);border:2px solid var(--ink);padding:28px;box-shadow:6px 6px 0 var(--ink)}
.lhm-poll h3{font-size:38px;margin:6px 0}
.lhm-poll>p{color:var(--muted)}
.lhm-poll-buttons{display:grid;gap:10px;margin-top:28px}
.lhm-poll-buttons button{border:2px solid var(--ink);padding:15px;font-size:11px;font-weight:900;letter-spacing:.12em;cursor:pointer}
.lhm-poll-buttons button:first-child{background:var(--sun)}
.lhm-poll-buttons button:last-child{background:white}
.lhm-results{margin-top:25px}
.lhm-results>div:not(.lhm-bar){display:flex;justify-content:space-between;font-size:10px;font-weight:900;letter-spacing:.1em;margin:12px 0 5px}
.lhm-bar{height:15px;border:1px solid var(--ink);background:white}
.lhm-bar i{display:block;height:100%;background:var(--coral);transition:width .5s ease}
.lhm-bar-alt i{background:var(--aqua-dark)}
.lhm-results small{display:block;margin-top:18px;color:var(--muted)}

.lhm-bathhouse{padding-top:90px;padding-bottom:85px}
.lhm-bath-grid{display:grid;grid-template-columns:repeat(3,1fr);border:2px solid var(--ink);background:var(--ink);gap:2px}
.lhm-bath-card{background:var(--paper);border:0;padding:18px;text-align:left;cursor:pointer}
.lhm-bath-card img{width:100%;height:255px;object-fit:cover;margin-bottom:20px}
.lhm-bath-card h3{font-size:29px;line-height:1.02;margin:8px 0 10px}
.lhm-bath-card p{color:var(--muted);line-height:1.5}
.lhm-bath-card>div{font-size:9px;font-weight:900;letter-spacing:.12em;margin-top:17px}
.lhm-bath-quote{font-family:"Fraunces",serif;font-size:25px;margin:28px 0 0}

.lhm-people{background:var(--paper);border-block:2px solid var(--ink);padding:78px clamp(16px,4vw,60px)}
.lhm-people>.lhm-section-title,.lhm-people-grid{max-width:1420px;margin-left:auto;margin-right:auto}
.lhm-people-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:50px;margin-top:55px}
.lhm-person{border:0;background:transparent;text-align:left;cursor:pointer}
.lhm-person.person-2{transform:translateY(30px)}
.lhm-person.person-3{transform:translateY(8px)}
.lhm-polaroid{background:var(--cream);padding:12px 12px 22px;border:2px solid var(--ink);box-shadow:6px 6px 0 var(--ink);position:relative;transform:rotate(-1deg)}
.lhm-person.person-2 .lhm-polaroid{transform:rotate(1.4deg)}
.lhm-person.person-3 .lhm-polaroid{transform:rotate(-.5deg)}
.lhm-tape{position:absolute;top:-13px;left:50%;transform:translateX(-50%) rotate(-3deg);width:90px;height:23px;background:rgba(245,205,77,.75);z-index:2}
.lhm-polaroid img{width:100%;height:390px;object-fit:cover;filter:saturate(.9)}
.lhm-polaroid strong{font-family:"Fraunces",serif;display:block;text-align:center;font-size:26px;margin-top:16px}
.lhm-polaroid small{display:block;text-align:center;font-size:10px;font-weight:900;letter-spacing:.13em;color:var(--coral-dark)}
.lhm-person>p{font-family:"Fraunces",serif;font-size:21px;line-height:1.25;margin:20px 0 12px}
.lhm-person>span{font-size:10px;font-weight:900;letter-spacing:.12em;color:var(--coral-dark)}

.lhm-ask{max-width:1340px;margin:90px auto;padding:0 clamp(16px,3vw,35px);display:grid;grid-template-columns:1fr 1fr;gap:38px;align-items:start}
.lhm-ask-copy{background:var(--aqua);border:2px solid var(--ink);box-shadow:7px 7px 0 var(--ink);padding:34px}
.lhm-ask-copy h2{font-size:clamp(33px,4vw,52px);line-height:.98;margin:9px 0 18px}
.lhm-ask-copy>p{line-height:1.55}
.lhm-ask form{display:grid;gap:10px;margin-top:24px}
.lhm-ask textarea{border:2px solid var(--ink);background:var(--paper);padding:14px;resize:vertical}
.lhm-ask form button{border:2px solid var(--ink);background:var(--coral);color:white;padding:14px;font-size:10px;font-weight:900;letter-spacing:.14em;cursor:pointer}
.lhm-success{font-family:"Fraunces",serif;font-size:17px;color:var(--coral-dark);display:block;margin-top:8px}
.lhm-answers{display:grid;gap:18px}
.lhm-answers article{background:var(--paper);border:2px solid var(--ink);padding:25px;box-shadow:4px 4px 0 var(--ink)}
.lhm-answers article:nth-child(2){transform:rotate(.7deg)}
.lhm-answers p{font-family:"Fraunces",serif;font-size:24px;line-height:1.25;margin:0 0 15px}
.lhm-answers span{font-size:9px;font-weight:900;letter-spacing:.13em}

.lhm-good-stuff{padding-bottom:90px}
.lhm-picks{display:grid;grid-template-columns:repeat(3,1fr);gap:32px 24px}
.lhm-pick.offset{transform:translateY(28px)}
.lhm-pick img{width:100%;height:265px;object-fit:cover;border:2px solid var(--ink);box-shadow:4px 4px 0 var(--ink)}
.lhm-pick h3{font-size:24px;margin:16px 0 4px}
.lhm-pick p{color:var(--muted);margin:0}

.lhm-newsletter{background:#193f36;color:white;border-block:3px solid var(--ink);padding:70px clamp(16px,4vw,60px);position:relative;overflow:hidden}
.lhm-newsletter:before{content:"☀";position:absolute;left:-40px;bottom:-90px;font-size:250px;color:rgba(245,205,77,.13)}
.lhm-newsletter-card{position:relative;max-width:1250px;margin:0 auto;display:grid;grid-template-columns:1.2fr .9fr;gap:25px 70px;align-items:start}
.lhm-newsletter h2{font-size:clamp(45px,6vw,78px);line-height:.9;margin:10px 0 14px}
.lhm-newsletter p{font-size:18px;line-height:1.5;max-width:700px;color:#d9ebe3}
.lhm-newsletter ul{list-style:none;padding:0;margin:0;display:grid;gap:13px;font-weight:700}
.lhm-newsletter form{grid-column:1/-1;display:flex;align-items:center;background:var(--paper);color:var(--ink);border:2px solid white;max-width:760px;padding:5px}
.lhm-newsletter input{flex:1;border:0;background:transparent;padding:13px;min-width:0}
.lhm-newsletter input:focus{outline:none}
.lhm-newsletter form>svg{margin-left:10px}
.lhm-newsletter button{border:2px solid var(--ink);background:var(--sun);padding:12px 20px;font-size:10px;font-weight:900;letter-spacing:.14em;cursor:pointer}
.lhm-newsletter .lhm-success{grid-column:1/-1;color:#f5cd4d}

.lhm-latest{padding-top:90px;padding-bottom:85px}
.lhm-latest-list{border-top:2px solid var(--ink)}
.lhm-latest-row{width:100%;display:grid;grid-template-columns:105px 105px 1fr auto;gap:20px;align-items:center;border:0;border-bottom:1px solid rgba(32,37,31,.35);background:transparent;padding:15px 0;text-align:left;cursor:pointer}
.lhm-latest-time{font-size:10px;font-weight:900;letter-spacing:.1em;color:var(--coral-dark);text-transform:uppercase}
.lhm-latest-row img{width:105px;height:85px;object-fit:cover}
.lhm-latest-row>div>span{font-size:9px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.lhm-latest-row h3{font-size:25px;margin:4px 0}
.lhm-latest-row p{margin:0;color:var(--muted);font-size:13px}
.lhm-latest-row:hover h3{color:var(--coral-dark)}

.lhm-travel-strip{max-width:1360px;margin:0 auto 90px;border:2px solid var(--ink);display:grid;grid-template-columns:260px 1fr;box-shadow:7px 7px 0 var(--ink);background:var(--sun)}
.lhm-travel-strip>div{border-right:2px solid var(--ink);display:flex;flex-direction:column;gap:10px;align-items:center;justify-content:center;font-weight:900;letter-spacing:.13em}
.lhm-travel-strip>button{background:transparent;border:0;padding:30px;text-align:left;cursor:pointer}
.lhm-travel-strip h2{font-size:34px;margin:0 0 7px}
.lhm-travel-strip p{margin:0 0 13px}
.lhm-travel-strip button>span{font-size:10px;font-weight:900;letter-spacing:.13em}

.lhm-soap-bridge{display:grid;grid-template-columns:1.1fr 1fr;background:#e7d8b5;border-block:3px solid var(--ink)}
.lhm-soap-image{position:relative;min-height:520px}
.lhm-soap-image img{width:100%;height:100%;object-fit:cover}
.lhm-soap-image span{position:absolute;left:25px;bottom:20px;background:var(--paper);border:2px solid var(--ink);padding:8px 12px;font-family:"Caveat",cursive;font-size:22px;transform:rotate(-2deg)}
.lhm-soap-copy{padding:clamp(40px,6vw,90px);display:flex;flex-direction:column;justify-content:center}
.lhm-soap-copy h2{font-size:clamp(50px,7vw,96px);line-height:.85;margin:12px 0 22px}
.lhm-soap-copy p{max-width:650px;font-size:18px;line-height:1.6}
.lhm-soap-copy>div{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}
.lhm-primary-link,.lhm-secondary-link{display:inline-flex;align-items:center;gap:8px;text-decoration:none;border:2px solid var(--ink);padding:13px 16px;font-size:10px;font-weight:900;letter-spacing:.12em}
.lhm-primary-link{background:var(--coral);color:white}
.lhm-secondary-link{background:transparent;cursor:pointer}

.lhm-footer{background:#9adbd5;border-top:3px solid var(--ink);padding:45px clamp(18px,4vw,60px) 28px;display:grid;grid-template-columns:1.1fr 1fr;gap:40px}
.lhm-footer-brand img{width:180px;mix-blend-mode:multiply}
.lhm-footer-brand span{display:block;margin-top:15px;font-family:"Caveat",cursive;font-size:24px}
.lhm-footer-cols{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
.lhm-footer-cols div{display:grid;align-content:start;gap:8px}
.lhm-footer-cols strong{font-size:9px;letter-spacing:.14em}
.lhm-footer-cols a{text-decoration:none;font-size:13px}
.lhm-footer-wave{grid-column:1/-1;border-top:1px solid var(--ink);padding-top:18px;display:flex;align-items:center;justify-content:space-between;font-size:10px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}

.lhm-overlay{position:fixed;inset:0;z-index:100;background:rgba(25,29,24,.72);backdrop-filter:blur(8px);display:grid;place-items:center;padding:20px;overflow:auto}
.lhm-search-modal,.lhm-person-modal{position:relative;width:min(900px,100%);max-height:90vh;overflow:auto;background:var(--paper);border:2px solid var(--ink);box-shadow:9px 9px 0 var(--ink);padding:34px}
.lhm-modal-close{position:absolute;right:15px;top:15px;border:2px solid var(--ink);background:var(--paper);width:38px;height:38px;display:grid;place-items:center;cursor:pointer;z-index:2}
.lhm-search-modal h2{font-size:48px;margin:7px 0 24px}
.lhm-search-box{display:flex;align-items:center;gap:10px;border:2px solid var(--ink);padding:10px 13px;background:white}
.lhm-search-box input{flex:1;border:0;font-size:18px}
.lhm-search-box input:focus{outline:none}
.lhm-search-results{display:grid;gap:1px;margin-top:20px;background:var(--ink)}
.lhm-search-results button{display:grid;grid-template-columns:95px 1fr;gap:14px;text-align:left;background:var(--paper);border:0;padding:10px;cursor:pointer}
.lhm-search-results img{width:95px;height:72px;object-fit:cover}
.lhm-search-results small{display:block;font-size:9px;font-weight:900;letter-spacing:.12em;color:var(--coral-dark);text-transform:uppercase}
.lhm-search-results strong{font-family:"Fraunces",serif;font-size:20px;line-height:1.1}

.story-overlay{align-items:start}
.lhm-story-modal{position:relative;width:min(920px,100%);margin:25px auto;background:var(--paper);border:2px solid var(--ink);box-shadow:9px 9px 0 var(--ink);padding:clamp(26px,5vw,60px)}
.lhm-story-modal>h2{font-size:clamp(45px,7vw,82px);line-height:.9;margin:10px 50px 15px 0}
.lhm-story-dek{font-family:"Fraunces",serif;font-size:22px;line-height:1.45;max-width:760px}
.lhm-story-byline{font-size:9px;font-weight:900;letter-spacing:.13em;margin:22px 0}
.lhm-story-hero{width:100%;height:min(55vw,540px);object-fit:cover;border:2px solid var(--ink)}
.lhm-story-body{max-width:720px;margin:38px auto 0}
.lhm-story-body p{font-family:"Fraunces",serif;font-size:20px;line-height:1.75}
.lhm-story-body blockquote{font-family:"Caveat",cursive;font-size:35px;color:var(--coral-dark);border-left:5px solid var(--coral);margin:40px 0;padding-left:22px}
.lhm-story-body .lhm-story-note{font-family:"DM Sans",sans-serif;font-size:13px;color:var(--muted);border-top:1px solid var(--ink);padding-top:18px}

.lhm-person-modal{display:grid;grid-template-columns:.8fr 1.2fr;gap:30px;align-items:start}
.lhm-person-modal>img{width:100%;height:470px;object-fit:cover;border:2px solid var(--ink)}
.lhm-person-modal h2{font-size:60px;margin:5px 0}
.lhm-person-line{font-family:"Fraunces",serif;font-size:24px}
.lhm-person-modal h3{font-size:24px;border-top:1px solid var(--ink);padding-top:18px;margin-top:28px}
.lhm-person-modal div>button{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;border:0;border-bottom:1px solid rgba(32,37,31,.3);background:transparent;padding:12px 0;font-family:"Fraunces",serif;font-size:18px;cursor:pointer}

@media (max-width:1100px){
  .lhm-nav{display:none}
  .lhm-menu{display:grid}
  .lhm-hero-grid{grid-template-columns:1fr}
  .lhm-side-stories{grid-template-columns:repeat(3,1fr)}
  .lhm-side-story{grid-template-columns:1fr;padding-bottom:0;border:2px solid var(--ink);background:var(--paper);padding:8px}
  .lhm-side-story img{width:100%;height:180px}
  .lhm-lanes{grid-template-columns:1fr}
  .lhm-tried-grid{grid-template-columns:1fr}
  .lhm-bath-grid{grid-template-columns:1fr 1fr}
  .lhm-people-grid{gap:22px}
  .lhm-polaroid img{height:320px}
}
@media (max-width:760px){
  .lhm-header{height:68px;padding:0 12px;gap:10px}
  .lhm-brand img{width:115px;height:43px}
  .lhm-brand span{display:none}
  .lhm-checkin{padding:10px 11px}
  .lhm-mobile-nav{top:68px}
  .lhm-hero{padding-top:28px}
  .lhm-photo-frame img{height:62vw}
  .lhm-feature h1{font-size:48px}
  .lhm-feature p{font-size:18px}
  .lhm-side-stories{grid-template-columns:1fr}
  .lhm-side-story{grid-template-columns:105px 1fr}
  .lhm-side-story img{width:105px;height:100px}
  .lhm-trend-row{grid-template-columns:45px 1fr;gap:10px}
  .lhm-signal{grid-column:2;justify-self:start}
  .lhm-section-title{align-items:start;flex-direction:column}
  .lhm-tried{padding-top:48px;padding-bottom:50px}
  .lhm-tried-story img{height:260px}
  .lhm-bath-grid{grid-template-columns:1fr}
  .lhm-people-grid{grid-template-columns:1fr;gap:50px}
  .lhm-person.person-2,.lhm-person.person-3{transform:none}
  .lhm-polaroid img{height:430px}
  .lhm-ask{grid-template-columns:1fr}
  .lhm-picks{grid-template-columns:1fr 1fr}
  .lhm-pick.offset{transform:none}
  .lhm-pick img{height:190px}
  .lhm-newsletter-card{grid-template-columns:1fr}
  .lhm-newsletter form,.lhm-newsletter .lhm-success{grid-column:1}
  .lhm-newsletter form{flex-wrap:wrap}
  .lhm-newsletter button{width:100%}
  .lhm-latest-row{grid-template-columns:72px 1fr auto}
  .lhm-latest-row img{display:none}
  .lhm-latest-row p{display:none}
  .lhm-travel-strip{margin-left:16px;margin-right:16px;grid-template-columns:1fr}
  .lhm-travel-strip>div{border-right:0;border-bottom:2px solid var(--ink);padding:18px}
  .lhm-soap-bridge{grid-template-columns:1fr}
  .lhm-soap-image{min-height:340px}
  .lhm-soap-copy{padding:42px 22px}
  .lhm-footer{grid-template-columns:1fr}
  .lhm-footer-cols{grid-template-columns:repeat(3,1fr)}
  .lhm-person-modal{grid-template-columns:1fr}
  .lhm-person-modal>img{height:360px}
}
@media (max-width:480px){
  .lhm-header-actions .lhm-icon-btn{display:none}
  .lhm-checkin{font-size:9px}
  .lhm-feature h1{font-size:43px}
  .lhm-picks{grid-template-columns:1fr}
  .lhm-pick img{height:250px}
  .lhm-polaroid img{height:360px}
  .lhm-footer-cols{grid-template-columns:1fr 1fr}
  .lhm-story-modal{padding:23px}
  .lhm-story-modal>h2{font-size:43px}
}
`;
