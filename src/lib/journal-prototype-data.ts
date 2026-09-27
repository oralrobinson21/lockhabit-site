export type PrototypeAuthor = {
  slug: "maya" | "chris" | "jules";
  name: string;
  desk: string;
  line: string;
  bio: string;
  image: string;
};

export type PrototypeStory = {
  slug: string;
  title: string;
  dek: string;
  category: string;
  lane: "RIGHT NOW" | "HELP ME" | "ENTERTAIN ME";
  franchise: string;
  author: PrototypeAuthor["slug"];
  readTime: number;
  age: string;
  image: string;
  body: string[];
  sources: Array<{ label: string; url: string }>;
};

export const prototypeAuthors: PrototypeAuthor[] = [
  {
    slug: "maya",
    name: "Maya",
    desk: "Skin & Ingredients",
    line: "Will read an ingredient label for fun.",
    bio: "Maya translates ingredient lists, skin-care claims, and bathroom folklore into useful language without pretending every trend is a miracle.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85",
  },
  {
    slug: "chris",
    name: "Chris",
    desk: "Wellness Experiments",
    line: "Will apparently try anything once.",
    bio: "Chris handles the first-person experiments: cold showers, dark showers, strange routines, and anything the internet swears will change your life by Tuesday.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=85",
  },
  {
    slug: "jules",
    name: "Jules",
    desk: "Travel & Good Living",
    line: "Professionally avoids bad vacations.",
    bio: "Jules covers travel rituals, hotel bathrooms, small luxuries, and the tiny choices that make ordinary days feel less ordinary.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85",
  },
];

export const prototypeStories: PrototypeStory[] = [
  {
    slug: "apparently-everyone-is-showering-wrong",
    title: "Apparently Everyone Is Showering Wrong",
    dek: "We asked what actually matters — and what the internet may have made dramatically more complicated than necessary.",
    category: "Bathhouse",
    lane: "RIGHT NOW",
    franchise: "WHAT EVERYONE'S TALKING ABOUT",
    author: "maya",
    readTime: 6,
    age: "12 min ago",
    image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1600&q=88",
    body: [
      "The internet has turned the shower into a control room. Temperatures, timers, brushes, filters, double cleanses, triple cleanses, and at least one gadget with a blue light are now apparently required before breakfast.",
      "The useful part is simpler: comfortable water, gentle cleansing where you actually need it, and paying attention to how your skin feels afterward. A routine can be thoughtful without becoming a project plan.",
      "We are keeping this story deliberately boring where the evidence is boring. That is part of the point. Better habits do not always arrive with a dramatic reveal.",
    ],
    sources: [
      { label: "American Academy of Dermatology — bathing and skin care guidance", url: "https://www.aad.org/" },
      { label: "National Library of Medicine / PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" },
    ],
  },
  {
    slug: "shower-in-complete-darkness",
    title: "I Took a Shower in Complete Darkness for 7 Nights",
    dek: "A wellness experiment with less science-fiction energy than expected and much more toe-stubbing than advertised.",
    category: "We Tried It",
    lane: "ENTERTAIN ME",
    franchise: "WE TRIED IT",
    author: "chris",
    readTime: 5,
    age: "34 min ago",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=88",
    body: [
      "This began as a test of whether removing bright bathroom light would make a nighttime shower feel calmer. It immediately became a test of whether I knew where anything in my own bathroom was.",
      "By night three, the interesting part was not darkness itself. It was the forced lack of multitasking. No phone. No mirror. No visual clutter. Just the shower and the very loud realization that the shampoo bottle lives farther left than I thought.",
      "I would not call this a universal sleep hack. I would call it a strangely effective way to make an ordinary routine feel different.",
    ],
    sources: [
      { label: "Sleep Foundation — light and sleep overview", url: "https://www.sleepfoundation.org/" },
    ],
  },
  {
    slug: "magnesium-on-feet",
    title: "Why Is Everyone Suddenly Putting Magnesium on Their Feet?",
    dek: "The trend is everywhere. The evidence is considerably less dramatic.",
    category: "Ingredients",
    lane: "RIGHT NOW",
    franchise: "IS THIS ACTUALLY GOOD FOR YOU?",
    author: "maya",
    readTime: 7,
    age: "1 hr ago",
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=1400&q=88",
    body: [
      "Magnesium has legitimate roles in human biology. That does not automatically validate every topical magnesium claim you see in a short video.",
      "The useful question is not whether magnesium matters. It is whether a specific product, dose, route, and outcome have actually been studied. Those are different questions.",
      "For this kind of story, LOCKHABIT should always separate plausible mechanism, traditional use, preliminary evidence, and well-supported conclusions instead of blending them together.",
    ],
    sources: [
      { label: "NIH Office of Dietary Supplements — Magnesium", url: "https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/" },
      { label: "PubMed search — transdermal magnesium", url: "https://pubmed.ncbi.nlm.nih.gov/" },
    ],
  },
  {
    slug: "five-minute-reset",
    title: "The 5-Minute Reset We Keep Coming Back To",
    dek: "No powders, no app, no $87 gadget. Just a tiny ritual that makes the next hour feel less noisy.",
    category: "Good Living",
    lane: "HELP ME",
    franchise: "THE FIVE-MINUTE RESET",
    author: "jules",
    readTime: 4,
    age: "2 hrs ago",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=88",
    body: [
      "Five minutes is short enough to actually do and long enough to interrupt momentum.",
      "The LOCKHABIT version is intentionally flexible: put the phone down, change rooms if you can, drink something, wash your face or hands, and choose one thing you want the next hour to be about.",
      "This is not medicine. It is an interruption. Sometimes that is enough to make a day feel more manageable.",
    ],
    sources: [],
  },
  {
    slug: "clean-vs-stripped",
    title: "The Difference Between Clean and Stripped Skin",
    dek: "If your skin feels like shrink-wrap after a shower, that sensation is not automatically proof that you cleaned better.",
    category: "Bathhouse",
    lane: "HELP ME",
    franchise: "FROM THE BATHHOUSE",
    author: "maya",
    readTime: 6,
    age: "Yesterday",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1400&q=88",
    body: [
      "A squeaky sensation can feel psychologically satisfying because we associate it with removal. Skin comfort is more complicated.",
      "Cleansing removes sweat, oils, debris, and products, but an aggressive routine can also remove more surface lipids than some skin tolerates comfortably.",
      "The better question is whether the cleanser and routine suit the person, the body area, the climate, and the frequency of washing.",
    ],
    sources: [
      { label: "American Academy of Dermatology", url: "https://www.aad.org/" },
    ],
  },
  {
    slug: "shower-does-not-need-14-steps",
    title: "Your Shower Does Not Need 14 Steps",
    dek: "Permission to fire your bathroom project manager.",
    category: "Bathhouse",
    lane: "HELP ME",
    franchise: "FROM THE BATHHOUSE",
    author: "maya",
    readTime: 4,
    age: "Yesterday",
    image: "https://images.unsplash.com/photo-1603712725038-e9334ae8f39f?auto=format&fit=crop&w=1400&q=88",
    body: [
      "A good routine can be simple. In fact, simplicity is often what makes a routine repeatable.",
      "Start with the jobs that actually need doing. Cleanse. Rinse. Moisturize if your skin benefits from it. Add extras because they improve the experience, not because a numbered graphic told you they are mandatory.",
    ],
    sources: [],
  },
  {
    slug: "soap-feels-different-in-winter",
    title: "Why Your Soap Feels Different in Winter",
    dek: "Same bar, different bathroom, different air, different skin.",
    category: "Ingredients",
    lane: "HELP ME",
    franchise: "FROM THE BATHHOUSE",
    author: "maya",
    readTime: 5,
    age: "2 days ago",
    image: "https://images.unsplash.com/photo-1607006483225-39888e13f871?auto=format&fit=crop&w=1400&q=88",
    body: [
      "Cold outdoor air, heated indoor air, hotter showers, and seasonal routine changes can all alter how skin feels.",
      "That means a product can feel different across seasons even when the formula has not changed.",
    ],
    sources: [
      { label: "American Academy of Dermatology — dry skin guidance", url: "https://www.aad.org/" },
    ],
  },
  {
    slug: "hotel-bathrooms-worth-copying",
    title: "Three Hotel Bathroom Ideas Worth Stealing at Home",
    dek: "No marble renovation required.",
    category: "Travel Brain",
    lane: "ENTERTAIN ME",
    franchise: "VACATION BRAIN",
    author: "jules",
    readTime: 5,
    age: "3 days ago",
    image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1400&q=88",
    body: [
      "Hotels are unusually good at making a tiny number of objects feel intentional.",
      "The easiest things to borrow are not the expensive ones: better towel placement, fewer visible containers, and lighting that does not make 6:30 a.m. feel like an interrogation.",
    ],
    sources: [],
  },
];

export function prototypeAuthor(slug: string) {
  return prototypeAuthors.find((author) => author.slug === slug);
}

export function prototypeStory(slug: string) {
  return prototypeStories.find((story) => story.slug === slug);
}
