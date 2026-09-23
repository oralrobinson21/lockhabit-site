import coconutReal1 from "@/assets/real-products/coconut-beach-1.jpg";
import coconutReal2 from "@/assets/real-products/coconut-beach-2.jpg";
import coconutReal3 from "@/assets/real-products/coconut-beach-3.jpg";
import coconutReal4 from "@/assets/real-products/coconut-beach-4.jpg";
import breatheReal1 from "@/assets/real-products/breathe-clear-1.jpg";
import breatheReal2 from "@/assets/real-products/breathe-clear-2.jpg";
import breatheReal3 from "@/assets/real-products/breathe-clear-3.jpg";
import breatheReal4 from "@/assets/real-products/breathe-clear-4.jpg";
import aloeReal1 from "@/assets/real-products/aloe-cucumber-1.jpg";
import aloeReal2 from "@/assets/real-products/aloe-cucumber-2.jpg";
import aloeReal3 from "@/assets/real-products/aloe-cucumber-3.jpg";
import aloeReal4 from "@/assets/real-products/aloe-cucumber-4.jpg";
import slumberReal1 from "@/assets/real-products/slumber-1.jpg";
import slumberReal2 from "@/assets/real-products/slumber-2.jpg";
import slumberReal3 from "@/assets/real-products/slumber-3.jpg";
import slumberReal4 from "@/assets/real-products/slumber-4.jpg";
import luffaReal1 from "@/assets/real-products/exfoliating-luffa-1.jpg";
import luffaReal2 from "@/assets/real-products/exfoliating-luffa-2.jpg";
import luffaReal3 from "@/assets/real-products/exfoliating-luffa-3.jpg";
import luffaReal4 from "@/assets/real-products/exfoliating-luffa-4.jpg";
import lemongrassReal1 from "@/assets/real-products/lemongrass-sage-1.jpg";
import lemongrassReal2 from "@/assets/real-products/lemongrass-sage-2.jpg";
import lemongrassReal3 from "@/assets/real-products/lemongrass-sage-3.jpg";
import lemongrassReal4 from "@/assets/real-products/lemongrass-sage-4.jpg";
import sandalwoodReal1 from "@/assets/real-products/rich-sandalwood-1.jpg";
import sandalwoodReal2 from "@/assets/real-products/rich-sandalwood-2.jpg";
import sandalwoodReal3 from "@/assets/real-products/rich-sandalwood-3.jpg";
import sandalwoodReal4 from "@/assets/real-products/rich-sandalwood-4.jpg";
import oatHoneyReal1 from "@/assets/real-products/oat-honey-1.jpg";
import oatHoneyReal2 from "@/assets/real-products/oat-honey-2.jpg";
import oatHoneyReal3 from "@/assets/real-products/oat-honey-3.jpg";
import oatHoneyReal4 from "@/assets/real-products/oat-honey-4.jpg";
import lavenderReal1 from "@/assets/real-products/calming-lavender-1.jpg";
import lavenderReal2 from "@/assets/real-products/calming-lavender-2.jpg";
import lavenderReal3 from "@/assets/real-products/calming-lavender-3.jpg";
import lavenderReal4 from "@/assets/real-products/calming-lavender-4.jpg";
import charcoalReal1 from "@/assets/real-products/charcoal-1.jpg";
import charcoalReal2 from "@/assets/real-products/charcoal-2.jpg";
import charcoalReal3 from "@/assets/real-products/charcoal-3.jpg";
import charcoalReal4 from "@/assets/real-products/charcoal-4.jpg";
import sheaReal1 from "@/assets/real-products/raw-shea-1.jpg";
import sheaReal2 from "@/assets/real-products/raw-shea-2.jpg";
import sheaReal3 from "@/assets/real-products/raw-shea-3.jpg";
import sheaReal4 from "@/assets/real-products/raw-shea-4.jpg";
import turmericReal1 from "@/assets/real-products/kojic-turmeric-1.jpg";
import turmericReal2 from "@/assets/real-products/kojic-turmeric-2.jpg";
import turmericReal3 from "@/assets/real-products/kojic-turmeric-3.jpg";
import turmericReal4 from "@/assets/real-products/kojic-turmeric-4.jpg";

export type GalleryImage = {
  src: string;
  alt: string;
  crop?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  illustrative?: boolean;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  note: string;
  price: number;
  kind: "Soap bar" | "Body care";
  tagline: string;
  description: string;
  highlights: string[];
  ingredients: string[];
  productType: string;
  netWeight: string;
  suggestedUse: string;
  warning: string;
  attributes?: string[];
  allAttributes?: string[];
  productStory?: string;
  /** Search title. Falls back to the product name when a bar has not been written yet. */
  seoTitle?: string;
  /** Search description. Falls back to the on-page description. */
  seoDescription?: string;
  /** Label-style ingredient line, when it differs from the ingredient list. */
  ingredientStatement?: string;
  madeIn?: string;
  faqs?: { question: string; answer: string }[];
  /** Drives the colour of the animated scene on the product page. */
  scene: { from: string; to: string; motes: string };
  images: GalleryImage[];
};

const soapUse =
  "Lather with warm water and apply to skin. Allow soap to dry between uses to extend longevity.";
const exfoliatingUse =
  "Lather with warm water and massage over skin in a circular motion to exfoliate and cleanse. Rinse thoroughly. Suitable for daily use.";
const externalWarning =
  "For external use only. Avoid contact with eyes and open wounds. Discontinue use if irritation occurs.";

const coconutFeaturedAttributes = ["Vegan", "Non-GMO", "Paraben free", "Sulfate free"];

const coconutSupplierAttributes = [
  "Alcohol free",
  "Mineral oil free",
  "Silicone free",
];

export const products: Product[] = [
  {
    id: 1,
    slug: "coconut-beach-soap",
    name: "Coconut Beach Soap",
    note: "Coconut · Creamy · Tropical",
    price: 35,
    kind: "Soap bar",
    tagline: "A little vacation in every shower.",
    description:
      "A creamy coconut-scented soap with a warm tropical finish and a rich everyday lather.",
    productStory:
      "Coconut Beach is a 4 oz coconut soap bar built on saponified organic extra virgin olive, palm and coconut oils with organic shea butter. It works into a creamy lather with a warm coconut fragrance — the closest your shower is getting to checking into a beach hotel on a Tuesday. Made in the USA.",
    seoTitle: "Coconut Beach Soap – Coconut & Shea Butter Bar | LOCKHABIT",
    seoDescription:
      "A creamy 4 oz vegan coconut soap bar made with organic coconut, olive and palm oils plus organic shea butter. Warm tropical scent. Made in the USA.",
    ingredientStatement:
      "Saponified Oils (Organic Extra Virgin Olive Oil, Organic Palm Oil, Organic Coconut Oil, Organic Shea Butter), Fragrance.",
    madeIn: "USA",
    faqs: [
      {
        question: "Is Coconut Beach Soap vegan?",
        answer: "Yes. Vegan is one of the supplier-listed attributes for this formula.",
      },
      {
        question: "What is Coconut Beach Soap made with?",
        answer:
          "Saponified organic extra virgin olive oil, organic palm oil, organic coconut oil, organic shea butter, and fragrance.",
      },
      {
        question: "How should I use and store Coconut Beach Soap?",
        answer:
          "Add warm water for a thick lather, wash, and rinse thoroughly. Keep the bar dry between uses to help it last longer.",
      },
      {
        question: "Where is Coconut Beach Soap made?",
        answer: "Coconut Beach Soap is made in the USA and has a net weight of 4 oz (113 g).",
      },
      {
        question: "Does Coconut Beach Soap ship free?",
        answer:
          "One bar is $35, and orders under $75 ship for a flat $7.95. Three bars are $89, which is $16 off the single-bar price and qualifies for free shipping.",
      },
    ],
    highlights: ["Warm coconut fragrance", "Organic oils + shea butter", "Vegan · sulfate-free"],
    attributes: coconutFeaturedAttributes,
    allAttributes: coconutSupplierAttributes,
    ingredients: [
      "Saponified organic extra virgin olive oil",
      "Organic palm oil",
      "Organic coconut oil",
      "Organic shea butter",
      "Fragrance",
    ],
    productType: "Bar Soap",
    netWeight: "4 oz (113 g)",
    suggestedUse:
      "Lather with warm water, wash, and rinse thoroughly. Keep the bar dry between uses to help it last longer.",
    warning:
      "In case of accidental contact with eyes, rinse thoroughly with clean water. If irritation occurs, discontinue use.",
    scene: { from: "#8ed7dd", to: "#f6d36b", motes: "#fffaf0" },
    images: [
      {
        src: coconutReal1,
        alt: "LOCKHABIT Coconut Beach Soap bar, front view, coconut and shea butter",
      },
      { src: coconutReal2, alt: "LOCKHABIT Coconut Beach Soap three-quarter view" },
      { src: coconutReal3, alt: "LOCKHABIT Coconut Beach Soap unwrapped bar view" },
      { src: coconutReal4, alt: "LOCKHABIT Coconut Beach Soap paired bar view" },
    ],
  },
  {
    id: 2,
    slug: "breathe-clear-soap",
    name: "Breathe Clear Soap",
    note: "Eucalyptus · Peppermint · Crisp",
    price: 35,
    kind: "Soap bar",
    tagline: "Steam, mint, and a wide-open shower.",
    description:
      "A crisp eucalyptus-and-peppermint aromatic bar with organic coconut oil, organic shea butter, and a fresh essential-oil blend.",
    productStory:
      "Breathe Clear is the bar for showers that need a little more fresh air. Eucalyptus and peppermint lead the scent, with rosemary, lemon and thyme rounding out the natural fragrance blend. The soap base pairs olive oil with organic palm, coconut and shea butter for a creamy everyday lather. Think steamy bathroom, cool mint in the air, and five quiet minutes before the day gets loud.",
    seoTitle: "Breathe Clear Soap – Eucalyptus & Peppermint Bar | LOCKHABIT",
    seoDescription:
      "Shop Breathe Clear Soap, a 4 oz eucalyptus and peppermint bar with organic coconut oil, organic shea butter and an essential-oil fragrance blend. Made in the USA.",
    ingredientStatement:
      "Saponified Oils (Olive Oil, Organic Palm Oil, Organic Coconut Oil, Organic Shea Butter), Natural Fragrance Oil Blend (Eucalyptus Essential Oil, Peppermint Essential Oil, Rosemary Essential Oil, Lemon Essential Oil, Thyme Essential Oil, Natural Fragrance).",
    madeIn: "USA",
    faqs: [
      {
        question: "What does Breathe Clear Soap smell like?",
        answer:
          "The fragrance is crisp and herbal, led by eucalyptus and peppermint with rosemary, lemon and thyme in the blend.",
      },
      {
        question: "Does Breathe Clear Soap contain fragrance?",
        answer:
          "Yes. The ingredient list includes a natural fragrance oil blend along with eucalyptus, peppermint, rosemary, lemon and thyme essential oils.",
      },
      {
        question: "What oils are in Breathe Clear Soap?",
        answer:
          "The soap base contains olive oil, organic palm oil, organic coconut oil and organic shea butter.",
      },
      {
        question: "How should I use and store the bar?",
        answer:
          "Add warm water for a thick lather, rinse thoroughly, and keep the bar dry between uses to help extend its longevity.",
      },
      {
        question: "Where is Breathe Clear Soap made?",
        answer: "Breathe Clear Soap is made in the USA and has a net weight of 4 oz (113 g).",
      },
    ],
    highlights: ["Eucalyptus + peppermint", "Organic coconut + shea", "Crisp herbal aroma"],
    attributes: ["Essential oil blend", "Organic coconut oil", "Organic shea butter", "Made in USA"],
    allAttributes: ["Gluten free", "Vegetarian", "Lactose free", "No fillers"],
    ingredients: [
      "Olive oil",
      "Organic palm oil",
      "Organic coconut oil",
      "Organic shea butter",
      "Eucalyptus essential oil",
      "Peppermint essential oil",
      "Rosemary essential oil",
      "Lemon essential oil",
      "Thyme essential oil",
      "Natural fragrance",
    ],
    productType: "Botanical Bar Soap",
    netWeight: "4 oz (113 g)",
    suggestedUse: soapUse,
    warning: externalWarning,
    scene: { from: "#dff5ef", to: "#edf8df", motes: "#ffffff" },
    images: [
      { src: breatheReal1, alt: "LOCKHABIT Breathe Clear Soap front view" },
      { src: breatheReal2, alt: "LOCKHABIT Breathe Clear Soap three-quarter view" },
      { src: breatheReal3, alt: "LOCKHABIT Breathe Clear Soap unwrapped bar view" },
      { src: breatheReal4, alt: "LOCKHABIT Breathe Clear Soap stacked bar view" },
    ],
  },
  {
    id: 3,
    slug: "aloe-cool-cucumber-soap",
    name: "Aloe & Cool Cucumber Soap",
    note: "Cucumber · Aloe · Fresh",
    price: 35,
    kind: "Soap bar",
    tagline: "Cold-drink freshness for warm skin.",
    description:
      "A fresh cucumber-scented bar with aloe vera, organic olive, palm and coconut oils, and organic shea butter.",
    productStory:
      "Aloe & Cool Cucumber is the poolside bar of the lineup: crisp cucumber fragrance, aloe vera, and a creamy base of saponified organic olive, palm and coconut oils with organic shea butter. It smells clean and bright without turning the shower into a fruit stand. Reach for it when you want the bathroom to feel a few degrees cooler, even when the city absolutely is not.",
    seoTitle: "Aloe & Cool Cucumber Soap – Aloe Bar Soap | LOCKHABIT",
    seoDescription:
      "A 4 oz aloe and cucumber-scented soap bar with organic olive, palm and coconut oils plus organic shea butter. Fresh, crisp and made in the USA.",
    ingredientStatement:
      "Saponified Oils (Organic Extra Virgin Olive Oil, Organic Palm Oil, Organic Coconut Oil, Organic Shea Butter), Fragrance, Chromium Oxide, Aloe Vera.",
    madeIn: "USA",
    faqs: [
      {
        question: "What does Aloe & Cool Cucumber Soap smell like?",
        answer:
          "It has a crisp fresh-cut cucumber style fragrance paired with the clean, green feel of aloe.",
      },
      {
        question: "Does the formula contain aloe vera?",
        answer: "Yes. Aloe vera is listed in the product's ingredient statement.",
      },
      {
        question: "What oils are in the soap base?",
        answer:
          "The base uses organic extra virgin olive oil, organic palm oil, organic coconut oil and organic shea butter.",
      },
      {
        question: "How should I use and store the bar?",
        answer:
          "Add warm water for a thick lather, rinse thoroughly, and keep the bar dry between uses to help extend its longevity.",
      },
      {
        question: "Where is Aloe & Cool Cucumber Soap made?",
        answer:
          "Aloe & Cool Cucumber Soap is made in the USA and has a net weight of 4 oz (113 g).",
      },
    ],
    highlights: ["Fresh cucumber aroma", "Aloe vera", "Organic oils + shea"],
    attributes: ["Aloe vera", "Organic oil base", "Organic shea butter", "Made in USA"],
    allAttributes: ["Gluten free", "Vegetarian", "Lactose free", "Fair trade coconut oil"],
    ingredients: [
      "Organic extra virgin olive oil",
      "Organic palm oil",
      "Organic coconut oil",
      "Organic shea butter",
      "Fragrance",
      "Chromium oxide",
      "Aloe vera",
    ],
    productType: "Botanical Bar Soap",
    netWeight: "4 oz (113 g)",
    suggestedUse: soapUse,
    warning: externalWarning,
    scene: { from: "#e0f6ea", to: "#e3f5f7", motes: "#f8fffb" },
    images: [
      { src: aloeReal1, alt: "LOCKHABIT Aloe & Cool Cucumber Soap front view" },
      { src: aloeReal2, alt: "LOCKHABIT Aloe & Cool Cucumber Soap three-quarter view" },
      { src: aloeReal3, alt: "LOCKHABIT Aloe & Cool Cucumber Soap unwrapped bar view" },
      { src: aloeReal4, alt: "LOCKHABIT Aloe & Cool Cucumber Soap paired bar view" },
    ],
  },
  {
    id: 4,
    slug: "slumber-soap",
    name: "Slumber Soap",
    note: "Fir · Lavender · Quiet",
    price: 35,
    kind: "Soap bar",
    tagline: "The last warm thing before bed.",
    description:
      "A fir-needle and lavender bar with organic palm, coconut and shea butter, built for a quiet end-of-day shower ritual.",
    productStory:
      "Slumber is what happens when the shower lights go low. Fir needle brings the clean, woodsy side; lavender softens the edges; and a base of olive oil with organic palm, coconut and shea butter keeps the ritual simple. It is not a sleep treatment and it does not need to be. It is just a warm shower, a forest-leaning scent, and permission for the day to be finished.",
    seoTitle: "Slumber Soap – Fir Needle & Lavender Bar | LOCKHABIT",
    seoDescription:
      "A 4 oz fir needle and lavender soap bar with olive oil, organic palm and coconut oils, and organic shea butter. A quiet woodsy-floral ritual made in the USA.",
    ingredientStatement:
      "Saponified Oils (Olive Oil, Organic Palm Oil, Organic Coconut Oil, Organic Shea Butter), Fir Needle Essential Oil, Lavender Essential Oil, Parsley Powder, Ultramarines.",
    madeIn: "USA",
    faqs: [
      {
        question: "What does Slumber Soap smell like?",
        answer:
          "Fir needle gives it a clean forest-like aroma while lavender adds a softer floral finish.",
      },
      {
        question: "Does Slumber Soap contain added fragrance?",
        answer:
          "No added fragrance is listed in the supplier ingredient statement; the scent comes from fir needle and lavender essential oils.",
      },
      {
        question: "Is Slumber Soap non-GMO?",
        answer: "Yes. Non-GMO is one of the attributes listed by the supplier for this product.",
      },
      {
        question: "How should I use and store the bar?",
        answer:
          "Add warm water for a thick lather, rinse thoroughly, and keep the bar dry between uses to help extend its longevity.",
      },
      {
        question: "Where is Slumber Soap made?",
        answer: "Slumber Soap is made in the USA and has a net weight of 4 oz (113 g).",
      },
    ],
    highlights: ["Fir needle + lavender", "No added fragrance listed", "Quiet evening ritual"],
    attributes: ["Non-GMO", "No added fragrance", "Essential oils", "Made in USA"],
    allAttributes: ["Gluten free", "Vegetarian", "Lactose free", "Organic coconut oil", "Organic shea butter"],
    ingredients: [
      "Olive oil",
      "Organic palm oil",
      "Organic coconut oil",
      "Organic shea butter",
      "Fir needle essential oil",
      "Lavender essential oil",
      "Parsley powder",
      "Ultramarines",
    ],
    productType: "Botanical Bar Soap",
    netWeight: "4 oz (113 g)",
    suggestedUse: soapUse,
    warning: externalWarning,
    scene: { from: "#e4e7f1", to: "#eee6f4", motes: "#fbf8ff" },
    images: [
      { src: slumberReal1, alt: "LOCKHABIT Slumber Soap front view" },
      { src: slumberReal2, alt: "LOCKHABIT Slumber Soap three-quarter view" },
      { src: slumberReal3, alt: "LOCKHABIT Slumber Soap unwrapped bar view" },
      { src: slumberReal4, alt: "LOCKHABIT Slumber Soap stacked bar view" },
    ],
  },
  {
    id: 5,
    slug: "exfoliating-luffa-bar",
    name: "Exfoliating Luffa Bar",
    note: "Luffa · Tea Tree · Grapefruit",
    price: 35,
    kind: "Soap bar",
    tagline: "Scrub and soap in one piece.",
    description:
      "An exfoliating bar with natural luffa, tea tree and grapefruit essential oils, plus shea, cocoa and mango butters.",
    productStory:
      "The Exfoliating Luffa Bar is the one that earns its spot by doing two jobs at once. Natural luffa is built right into the bar for physical exfoliation, while tea tree and grapefruit essential oils keep the scent fresh and clean. Shea, cocoa and mango butters round out the formula. It is the bar for elbows, knees, feet, pre-tan prep, or any shower where a plain washcloth feels a little underqualified.",
    seoTitle: "Exfoliating Luffa Bar – Tea Tree & Grapefruit | LOCKHABIT",
    seoDescription:
      "A 4 oz exfoliating luffa bar with natural luffa, tea tree and grapefruit essential oils plus shea, cocoa and mango butters. Made in the USA.",
    ingredientStatement:
      "Sorbitol, Coconut Oil, Propylene Glycol, Natural Luffa, Stearic Acid, Water, Sodium Hydroxide, Glycerin, Tea Tree Essential Oil, Shea Butter, Grapefruit Essential Oil, Cocoa Butter, Mango Butter, Hemp Extract, Titanium Dioxide.",
    madeIn: "USA",
    faqs: [
      {
        question: "What makes the Exfoliating Luffa Bar exfoliating?",
        answer:
          "Natural luffa is built into the bar, giving it a physical scrubbing texture while you wash.",
      },
      {
        question: "What does the Exfoliating Luffa Bar smell like?",
        answer:
          "Tea tree and grapefruit essential oils give the bar a fresh, clean and lightly citrusy aroma.",
      },
      {
        question: "Is the luffa exfoliation biodegradable?",
        answer:
          "Yes. The supplier specifically describes the natural luffa exfoliation in this bar as biodegradable.",
      },
      {
        question: "How should I use the bar?",
        answer:
          "Add warm water for a thick lather and use gentle circular motions where you want exfoliation. Rinse thoroughly and keep the bar dry between uses.",
      },
      {
        question: "Where is the Exfoliating Luffa Bar made?",
        answer: "The Exfoliating Luffa Bar is made in the USA and weighs 4 oz (113 g).",
      },
    ],
    highlights: ["Built-in natural luffa", "Tea tree + grapefruit", "Three rich butters"],
    attributes: ["Natural luffa", "Biodegradable exfoliation", "Essential oils", "Made in USA"],
    allAttributes: ["Gluten free", "Vegetarian", "Lactose free", "No fillers"],
    ingredients: [
      "Sorbitol",
      "Coconut oil",
      "Propylene glycol",
      "Natural luffa",
      "Stearic acid",
      "Water",
      "Sodium hydroxide",
      "Glycerin",
      "Tea tree essential oil",
      "Shea butter",
      "Grapefruit essential oil",
      "Cocoa butter",
      "Mango butter",
      "Hemp extract",
      "Titanium dioxide",
    ],
    productType: "Exfoliating Bar Soap",
    netWeight: "4 oz (113 g)",
    suggestedUse:
      "Add warm water for a thick lather. Massage gently over skin in circular motions where exfoliation is wanted, rinse thoroughly, and keep dry between uses.",
    warning: externalWarning,
    scene: { from: "#f7edda", to: "#e4f3ef", motes: "#fffdf7" },
    images: [
      { src: luffaReal1, alt: "LOCKHABIT Exfoliating Luffa Bar boxed front view" },
      { src: luffaReal2, alt: "LOCKHABIT Exfoliating Luffa Bar box and round bars" },
      { src: luffaReal3, alt: "LOCKHABIT Exfoliating Luffa Bar package and bar view" },
      { src: luffaReal4, alt: "LOCKHABIT Exfoliating Luffa Bar natural luffa texture view" },
    ],
  },
  {
    id: 6,
    slug: "lemongrass-sage-soap",
    name: "Lemongrass & Sage Soap",
    note: "Lemongrass · Sage · Green",
    price: 35,
    kind: "Soap bar",
    tagline: "A bright herbal wake-up call.",
    description:
      "A citrus-herbal bar made with organic palm, coconut, sunflower and extra virgin olive oils plus lemongrass and sage essential oils.",
    productStory:
      "Lemongrass & Sage is the front-desk wake-up call, only much nicer. Lemongrass brings the bright citrus edge, sage keeps it green and grounded, and the base is made from saponified organic palm, coconut, sunflower and extra virgin olive oils. There is no added fragrance listed in the formula — just the two essential oils doing the aromatic work. Morning shower strongly encouraged; alarm clock still unfortunately required.",
    seoTitle: "Lemongrass & Sage Soap – Herbal Citrus Bar | LOCKHABIT",
    seoDescription:
      "A 4 oz lemongrass and sage soap bar made with organic palm, coconut, sunflower and extra virgin olive oils plus essential oils. Made in the USA.",
    ingredientStatement:
      "Saponified Oils (Organic Palm Oil, Organic Coconut Oil, Organic Sunflower Oil, Organic Extra Virgin Olive Oil), Lemongrass Essential Oil, Sage Essential Oil.",
    madeIn: "USA",
    faqs: [
      {
        question: "What does Lemongrass & Sage Soap smell like?",
        answer:
          "Lemongrass gives it a bright citrus character while sage adds a dry, green herbal finish.",
      },
      {
        question: "Does Lemongrass & Sage Soap contain added fragrance?",
        answer:
          "No added fragrance is listed in the supplier ingredient statement; the aromatic ingredients are lemongrass and sage essential oils.",
      },
      {
        question: "What oils are in the soap base?",
        answer:
          "The base contains organic palm oil, organic coconut oil, organic sunflower oil and organic extra virgin olive oil.",
      },
      {
        question: "How should I use and store the bar?",
        answer:
          "Add warm water for a thick lather, rinse thoroughly, and keep the bar dry between uses to help extend its longevity.",
      },
      {
        question: "Where is Lemongrass & Sage Soap made?",
        answer: "Lemongrass & Sage Soap is made in the USA and weighs 4 oz (113 g).",
      },
    ],
    highlights: ["Lemongrass essential oil", "Sage essential oil", "No added fragrance listed"],
    attributes: ["Lemongrass essential oil", "Sage essential oil", "Organic oil base", "Made in USA"],
    allAttributes: ["Fair trade coconut oil", "Gluten free", "Vegetarian", "Lactose free"],
    ingredients: [
      "Organic palm oil",
      "Organic coconut oil",
      "Organic sunflower oil",
      "Organic extra virgin olive oil",
      "Lemongrass essential oil",
      "Sage essential oil",
    ],
    productType: "Botanical Bar Soap",
    netWeight: "4 oz (113 g)",
    suggestedUse: soapUse,
    warning: externalWarning,
    scene: { from: "#eef6d9", to: "#fff1c8", motes: "#ffffff" },
    images: [
      { src: lemongrassReal1, alt: "LOCKHABIT Lemongrass & Sage Soap front view" },
      { src: lemongrassReal2, alt: "LOCKHABIT Lemongrass & Sage Soap three-quarter view" },
      { src: lemongrassReal3, alt: "LOCKHABIT Lemongrass & Sage Soap unwrapped bar view" },
      { src: lemongrassReal4, alt: "LOCKHABIT Lemongrass & Sage Soap paired bar view" },
    ],
  },
  {
    id: 7,
    slug: "rich-sandalwood-soap",
    name: "Rich Sandalwood Soap",
    note: "Sandalwood · Oak · Spice",
    price: 35,
    kind: "Soap bar",
    tagline: "Warm wood, low light, no rush.",
    description:
      "A warm sandalwood-fragranced bar with charred-oak and light-spice notes over organic olive, palm and coconut oils plus organic shea butter.",
    productStory:
      "Rich Sandalwood is the lobby-after-dark bar: warm sandalwood fragrance, a little charred oak, and just enough light spice to keep it from feeling flat. Underneath is a simple saponified base of organic extra virgin olive, palm and coconut oils with organic shea butter. The result is warm, polished and quietly luxurious — less beach party, more old hotel bar with the good lighting.",
    seoTitle: "Rich Sandalwood Soap – Warm Woody Bar Soap | LOCKHABIT",
    seoDescription:
      "A 4 oz sandalwood-fragranced soap bar with charred-oak and light-spice notes, organic olive, palm and coconut oils, and organic shea butter. Made in the USA.",
    ingredientStatement:
      "Saponified Oils (Organic Extra Virgin Olive Oil, Organic Palm Oil, Organic Coconut Oil, Organic Shea Butter), Fragrance.",
    madeIn: "USA",
    faqs: [
      {
        question: "What does Rich Sandalwood Soap smell like?",
        answer:
          "The supplier describes the fragrance as sandalwood with smoky charred-oak notes and a touch of light spice.",
      },
      {
        question: "Does Rich Sandalwood Soap contain fragrance?",
        answer: "Yes. Fragrance is explicitly listed in the ingredient statement.",
      },
      {
        question: "What oils are in the soap base?",
        answer:
          "The base contains organic extra virgin olive oil, organic palm oil, organic coconut oil and organic shea butter.",
      },
      {
        question: "How should I use and store the bar?",
        answer:
          "Add warm water for a thick lather, rinse thoroughly, and keep the bar dry between uses to help extend its longevity.",
      },
      {
        question: "Where is Rich Sandalwood Soap made?",
        answer: "Rich Sandalwood Soap is made in the USA and weighs 4 oz (113 g).",
      },
    ],
    highlights: ["Warm sandalwood fragrance", "Charred oak + light spice", "Organic oils + shea"],
    attributes: ["Organic olive oil", "Organic coconut oil", "Organic shea butter", "Made in USA"],
    allAttributes: ["Fair trade coconut oil", "Gluten free", "Vegetarian", "Lactose free"],
    ingredients: [
      "Organic extra virgin olive oil",
      "Organic palm oil",
      "Organic coconut oil",
      "Organic shea butter",
      "Fragrance",
    ],
    productType: "Botanical Bar Soap",
    netWeight: "4 oz (113 g)",
    suggestedUse: soapUse,
    warning: externalWarning,
    scene: { from: "#f3e4d5", to: "#f8edda", motes: "#fff7ec" },
    images: [
      { src: sandalwoodReal1, alt: "LOCKHABIT Rich Sandalwood Soap front view" },
      { src: sandalwoodReal2, alt: "LOCKHABIT Rich Sandalwood Soap three-quarter view" },
      { src: sandalwoodReal3, alt: "LOCKHABIT Rich Sandalwood Soap unwrapped bar view" },
      { src: sandalwoodReal4, alt: "LOCKHABIT Rich Sandalwood Soap paired bar view" },
    ],
  },
  {
    id: 8,
    slug: "oat-milk-honey-soap",
    name: "Oat Milk Honey Soap",
    note: "Oatmeal · Goat Milk · Honey",
    price: 35,
    kind: "Soap bar",
    tagline: "The comfort-food bar of the shower.",
    description:
      "A creamy oat, goat-milk and honey soap with a soft summery fragrance and a base of olive, organic palm and coconut oils plus organic shea butter.",
    productStory:
      "Oat Milk Honey is the soft-sweater bar of the lineup. Oatmeal, goat milk and honey sit in a creamy soap base with olive oil, organic palm and coconut oils, and organic shea butter, finished with a light summery fragrance. The name says Oat Milk Honey, but we would rather be clear than cute: this formula contains goat milk, so it is not vegan or dairy-free. Cozy shower energy, full ingredient honesty.",
    seoTitle: "Oat Milk Honey Soap – Goat Milk, Oatmeal & Honey | LOCKHABIT",
    seoDescription:
      "A 4 oz oat, goat-milk and honey soap bar with olive oil, organic palm and coconut oils, organic shea butter and a soft fragrance. Made in the USA.",
    ingredientStatement:
      "Saponified Oils (Olive Oil, Organic Palm Oil, Organic Coconut Oil, Organic Shea Butter), Goat Milk, Fragrance, Oatmeal, Honey.",
    madeIn: "USA",
    faqs: [
      {
        question: "Does Oat Milk Honey Soap contain dairy?",
        answer:
          "Yes. The formula contains goat milk. It is not vegan or dairy-free, despite the product name beginning with Oat Milk.",
      },
      {
        question: "What is in Oat Milk Honey Soap?",
        answer:
          "The formula contains olive oil, organic palm oil, organic coconut oil, organic shea butter, goat milk, fragrance, oatmeal and honey.",
      },
      {
        question: "What does Oat Milk Honey Soap smell like?",
        answer:
          "The supplier describes it as a gentle, sweet, summery fragrance rather than an unscented bar.",
      },
      {
        question: "How should I use and store the bar?",
        answer:
          "Add warm water for a thick lather, rinse thoroughly, and keep the bar dry between uses to help extend its longevity.",
      },
      {
        question: "Where is Oat Milk Honey Soap made?",
        answer: "Oat Milk Honey Soap is made in the USA and weighs 4 oz (113 g).",
      },
    ],
    highlights: ["Oatmeal + honey", "Contains goat milk", "Creamy organic-oil base"],
    attributes: ["Cruelty free", "Paraben free", "Alcohol free", "Mineral oil free"],
    allAttributes: ["Gluten free", "No fillers", "Goat milk", "Oatmeal", "Honey", "Made in USA"],
    ingredients: [
      "Olive oil",
      "Organic palm oil",
      "Organic coconut oil",
      "Organic shea butter",
      "Goat milk",
      "Fragrance",
      "Oatmeal",
      "Honey",
    ],
    productType: "Botanical Bar Soap",
    netWeight: "4 oz (113 g)",
    suggestedUse: soapUse,
    warning: externalWarning,
    scene: { from: "#f4e7d2", to: "#fff4dc", motes: "#fffaf0" },
    images: [
      { src: oatHoneyReal1, alt: "LOCKHABIT Oat Milk Honey Soap front view" },
      { src: oatHoneyReal2, alt: "LOCKHABIT Oat Milk Honey Soap bar and packaging view" },
      { src: oatHoneyReal3, alt: "LOCKHABIT Oat Milk Honey Soap paired bar view" },
      { src: oatHoneyReal4, alt: "LOCKHABIT Oat Milk Honey Soap three-quarter view" },
    ],
  },
  {
    id: 9,
    slug: "calming-lavender-soap",
    name: "Calming Lavender Soap",
    note: "Lavender · Floral · Soft",
    price: 35,
    kind: "Soap bar",
    tagline: "Classic lavender, checked into a nicer room.",
    description:
      "A lavender essential-oil bar with real lavender buds, organic olive, palm and coconut oils, and organic shea butter.",
    productStory:
      "Calming Lavender keeps the formula pleasantly straightforward: lavender essential oil, real lavender buds, and a saponified base of organic extra virgin olive, palm and coconut oils with organic shea butter. No added fragrance is listed in the formula. It is floral without needing to shout about it — the kind of bar that makes an ordinary night shower feel a little more like room service for your routine.",
    seoTitle: "Calming Lavender Soap – Lavender Essential Oil Bar | LOCKHABIT",
    seoDescription:
      "A 4 oz lavender soap bar with lavender essential oil and buds, organic olive, palm and coconut oils, and organic shea butter. Made in the USA.",
    ingredientStatement:
      "Saponified Oils (Organic Extra Virgin Olive Oil, Organic Palm Oil, Organic Coconut Oil, Organic Shea Butter), Lavender Essential Oil, Lavender Buds.",
    madeIn: "USA",
    faqs: [
      {
        question: "What gives Calming Lavender Soap its scent?",
        answer:
          "Lavender essential oil is listed in the formula, along with real lavender buds.",
      },
      {
        question: "Does Calming Lavender Soap contain added fragrance?",
        answer:
          "No added fragrance is listed in the supplier ingredient statement. Lavender essential oil provides the aroma.",
      },
      {
        question: "What oils are in the soap base?",
        answer:
          "The base contains organic extra virgin olive oil, organic palm oil, organic coconut oil and organic shea butter.",
      },
      {
        question: "How should I use and store the bar?",
        answer:
          "Add warm water for a thick lather, rinse thoroughly, and keep the bar dry between uses to help extend its longevity.",
      },
      {
        question: "Where is Calming Lavender Soap made?",
        answer: "Calming Lavender Soap is made in the USA and weighs 4 oz (113 g).",
      },
    ],
    highlights: ["Lavender essential oil", "Real lavender buds", "No added fragrance listed"],
    attributes: ["Gluten free", "Vegetarian", "No added fragrance", "Made in USA"],
    allAttributes: ["Lactose free", "No fillers", "Lavender essential oil", "Lavender buds", "Fair trade coconut oil"],
    ingredients: [
      "Organic extra virgin olive oil",
      "Organic palm oil",
      "Organic coconut oil",
      "Organic shea butter",
      "Lavender essential oil",
      "Lavender buds",
    ],
    productType: "Botanical Bar Soap",
    netWeight: "4 oz (113 g)",
    suggestedUse: soapUse,
    warning: externalWarning,
    scene: { from: "#e9e0f5", to: "#f8effa", motes: "#fff9ff" },
    images: [
      { src: lavenderReal1, alt: "LOCKHABIT Calming Lavender Soap front view" },
      { src: lavenderReal2, alt: "LOCKHABIT Calming Lavender Soap three-quarter view" },
      { src: lavenderReal3, alt: "LOCKHABIT Calming Lavender Soap unwrapped bar view" },
      { src: lavenderReal4, alt: "LOCKHABIT Calming Lavender Soap paired bar view" },
    ],
  },
  {
    id: 10,
    slug: "charcoal-soap",
    name: "Charcoal Soap",
    note: "Charcoal · Peppermint · Tea Tree",
    price: 35,
    kind: "Soap bar",
    tagline: "The dark bar with the bright finish.",
    description:
      "An activated-charcoal bar with peppermint and tea tree essential oils over organic palm, coconut, sunflower and extra virgin olive oils.",
    productStory:
      "Charcoal is the clean-slate bar without the detox theater. Activated charcoal gives the bar its deep color and cleansing identity, while peppermint and tea tree essential oils bring a bright, fresh aroma. The base uses organic palm, coconut, sunflower and extra virgin olive oils, and the supplier specifically describes the charcoal level as non-staining in normal use. Dark suit, crisp shirt, shower edition.",
    seoTitle: "Charcoal Soap – Peppermint & Tea Tree Bar | LOCKHABIT",
    seoDescription:
      "A 4 oz activated-charcoal soap bar with peppermint and tea tree essential oils plus organic palm, coconut, sunflower and olive oils. Made in the USA.",
    ingredientStatement:
      "Saponified Oils (Organic Palm Oil, Organic Coconut Oil, Organic Sunflower Oil, Organic Extra Virgin Olive Oil), Peppermint Essential Oil, Tea Tree Essential Oil, Activated Charcoal.",
    madeIn: "USA",
    faqs: [
      {
        question: "What is in LOCKHABIT Charcoal Soap?",
        answer:
          "The formula contains organic palm, coconut, sunflower and extra virgin olive oils, peppermint essential oil, tea tree essential oil and activated charcoal.",
      },
      {
        question: "Does Charcoal Soap contain added fragrance?",
        answer:
          "No added fragrance is listed in the supplier ingredient statement. Peppermint and tea tree essential oils provide the aroma.",
      },
      {
        question: "Will the activated charcoal stain?",
        answer:
          "The supplier describes this formula as using a charcoal level designed to cleanse without staining during normal use.",
      },
      {
        question: "How should I use and store the bar?",
        answer:
          "Add warm water for a thick lather, rinse thoroughly, and keep the bar dry between uses to help extend its longevity.",
      },
      {
        question: "Where is Charcoal Soap made?",
        answer: "Charcoal Soap is made in the USA and weighs 4 oz (113 g).",
      },
    ],
    highlights: ["Activated charcoal", "Peppermint + tea tree", "No added fragrance listed"],
    attributes: ["Gluten free", "Vegetarian", "No added fragrance", "Made in USA"],
    allAttributes: ["Lactose free", "No fillers", "Activated charcoal", "Peppermint essential oil", "Tea tree essential oil", "Fair trade coconut oil"],
    ingredients: [
      "Organic palm oil",
      "Organic coconut oil",
      "Organic sunflower oil",
      "Organic extra virgin olive oil",
      "Peppermint essential oil",
      "Tea tree essential oil",
      "Activated charcoal",
    ],
    productType: "Charcoal Bar Soap",
    netWeight: "4 oz (113 g)",
    suggestedUse: soapUse,
    warning: externalWarning,
    scene: { from: "#d9dddc", to: "#f2f3ef", motes: "#fbfffd" },
    images: [
      { src: charcoalReal1, alt: "LOCKHABIT Charcoal Soap front view" },
      { src: charcoalReal2, alt: "LOCKHABIT Charcoal Soap three-quarter view" },
      { src: charcoalReal3, alt: "LOCKHABIT Charcoal Soap paired bar view" },
      { src: charcoalReal4, alt: "LOCKHABIT Charcoal Soap broken bar texture view" },
    ],
  },
  {
    id: 11,
    slug: "raw-shea-butter",
    name: "Raw Shea Butter",
    note: "Raw · Unrefined · One Ingredient",
    price: 42,
    kind: "Body care",
    tagline: "One ingredient. No tiny print required.",
    description:
      "100% raw, unrefined organic shea butter with no added fragrance — responsibly sourced, vegan and cruelty-free.",
    productStory:
      "Raw Shea Butter is the quiet overachiever at the front desk: one ingredient, no perfume cloud, no whipped-lotion disguise. It is 100% raw and unrefined organic shea butter, responsibly sourced and naturally nutty in scent. Warm a little between your hands and use it on skin, dry areas or hair. A small amount goes a long way, which is exactly how a one-ingredient product should behave.",
    seoTitle: "Raw Shea Butter – Organic, Unrefined & Vegan | LOCKHABIT",
    seoDescription:
      "Shop 4 oz raw unrefined organic shea butter. One ingredient, responsibly sourced, vegan, cruelty-free and free from added fragrance. Made in the USA.",
    ingredientStatement: "Butyrospermum Parkii (Shea) Butter (Organic).",
    madeIn: "USA",
    faqs: [
      {
        question: "What is in LOCKHABIT Raw Shea Butter?",
        answer: "One ingredient: organic Butyrospermum Parkii (Shea) Butter.",
      },
      {
        question: "Is Raw Shea Butter vegan and cruelty-free?",
        answer:
          "Yes. The supplier explicitly describes this raw shea butter as 100% vegan and cruelty-free.",
      },
      {
        question: "Does Raw Shea Butter contain added fragrance?",
        answer:
          "No. It is unscented in the sense that no fragrance is added; raw shea naturally has a mild nutty scent.",
      },
      {
        question: "How should I use and store Raw Shea Butter?",
        answer:
          "Apply a thin layer where skin or hair needs moisture. Store it in a cool, dry place around 60–70°F (15–21°C), away from direct sunlight.",
      },
      {
        question: "Is this a whipped body butter?",
        answer:
          "No. This is pure raw, unrefined shea butter rather than a whipped body butter or lotion.",
      },
    ],
    highlights: ["100% raw + unrefined", "Organic shea butter", "Vegan + cruelty-free"],
    attributes: ["100% raw shea", "Organic", "Vegan", "Cruelty free"],
    allAttributes: ["Responsibly sourced", "Non-GMO", "No fillers", "No added fragrance", "Made in USA"],
    ingredients: ["Organic Butyrospermum Parkii (Shea) Butter"],
    productType: "Raw Shea Butter",
    netWeight: "4 oz (113 g)",
    suggestedUse:
      "Apply a thin layer wherever skin or hair needs moisture. Store in a cool, dry place between 60–70°F (15–21°C), away from direct sunlight.",
    warning: externalWarning,
    scene: { from: "#f2e4ca", to: "#fff7e7", motes: "#fffaf0" },
    images: [
      { src: sheaReal1, alt: "LOCKHABIT Raw Shea Butter jar front view" },
      { src: sheaReal2, alt: "LOCKHABIT Raw Shea Butter jar held upright" },
      { src: sheaReal3, alt: "LOCKHABIT Raw Shea Butter jar held at an angle" },
      { src: sheaReal4, alt: "LOCKHABIT Raw Shea Butter open jar view" },
    ],
  },
  {
    id: 12,
    slug: "kojic-acid-turmeric-soap",
    name: "Kojic Acid & Turmeric Soap",
    note: "Turmeric · Kojic Acid · Citrus",
    price: 35,
    kind: "Soap bar",
    tagline: "Golden hour, now available in the shower.",
    description:
      "A 3.5 oz kojic-acid and turmeric bar with organic coconut, shea, palm, lemon and cocoa ingredients plus mango butter.",
    productStory:
      "Kojic Acid & Turmeric is the golden-hour bar: turmeric powder and kojic acid headline the formula, with organic coconut oil, shea butter, palm oil, lemon oil and cocoa butter plus mango butter underneath. The supplier positions the combination as a radiance-focused cleanser for a more even-looking finish; we keep the promise cosmetic and simple — cleanse, rinse, moisturize, repeat as your skin tolerates it. Bright bar, no miracle language.",
    seoTitle: "Kojic Acid & Turmeric Soap – Radiance Bar | LOCKHABIT",
    seoDescription:
      "A 3.5 oz kojic acid and turmeric soap with organic coconut oil, shea butter, palm oil, lemon oil, cocoa butter and mango butter. Made in the USA.",
    ingredientStatement:
      "Sorbitol, Organic Coconut Oil, Propylene Glycol, Stearic Acid, Water, Sodium Hydroxide, Kosher Glycerin, Organic Shea Butter, Organic Sustainable Palm Oil, Organic Lemon Oil, Organic Cocoa Butter, Mango Butter, Organic Turmeric Powder, Kojic Acid.",
    madeIn: "USA",
    faqs: [
      {
        question: "What are the key ingredients in Kojic Acid & Turmeric Soap?",
        answer:
          "The formula includes kojic acid and organic turmeric powder along with organic coconut oil, organic shea butter, organic palm oil, organic lemon oil, organic cocoa butter and mango butter.",
      },
      {
        question: "Does Kojic Acid & Turmeric Soap contain added fragrance?",
        answer:
          "No fragrance is listed in the supplier ingredient statement, and the supplier lists this product as fragrance-free.",
      },
      {
        question: "Is Kojic Acid & Turmeric Soap non-GMO?",
        answer: "Yes. Non-GMO is one of the attributes listed by the supplier for this product.",
      },
      {
        question: "How should I use Kojic Acid & Turmeric Soap?",
        answer:
          "Wet skin with warm water and lather in a circular motion. The supplier suggests leaving the lather on for 30–60 seconds, then rinsing thoroughly with cool water and patting dry. Stop use if irritation occurs.",
      },
      {
        question: "How big is the bar and where is it made?",
        answer:
          "Kojic Acid & Turmeric Soap is made in the USA and has a net weight of 3.5 oz (99 g).",
      },
    ],
    highlights: ["Kojic acid + turmeric", "Organic oils + rich butters", "Fragrance-free formula"],
    attributes: ["Non-GMO", "Cruelty free", "Fragrance free", "Paraben free"],
    allAttributes: ["Vegetarian", "No fillers", "Made in USA"],
    ingredients: [
      "Sorbitol",
      "Organic coconut oil",
      "Propylene glycol",
      "Stearic acid",
      "Water",
      "Sodium hydroxide",
      "Kosher glycerin",
      "Organic shea butter",
      "Organic sustainable palm oil",
      "Organic lemon oil",
      "Organic cocoa butter",
      "Mango butter",
      "Organic turmeric powder",
      "Kojic acid",
    ],
    productType: "Kojic Acid & Turmeric Bar Soap",
    netWeight: "3.5 oz (99 g)",
    suggestedUse:
      "Wet skin with warm water and lather in a circular motion. Leave on for 30–60 seconds, rinse thoroughly with cool water, and pat dry. Keep the bar dry between uses.",
    warning:
      "For topical use only. Not for internal consumption. Avoid contact with eyes. Discontinue use if irritation occurs; rinse eyes thoroughly with clean water after accidental contact.",
    scene: { from: "#f8df9b", to: "#fff4d2", motes: "#fff8df" },
    images: [
      { src: turmericReal1, alt: "LOCKHABIT Kojic Acid & Turmeric Soap front view" },
      { src: turmericReal2, alt: "LOCKHABIT Kojic Acid & Turmeric Soap packaged and unwrapped view" },
      { src: turmericReal3, alt: "LOCKHABIT Kojic Acid & Turmeric Soap three-bar view" },
      { src: turmericReal4, alt: "LOCKHABIT Kojic Acid & Turmeric Soap stacked bar view" },
    ],
  },

];

export const productBySlug = (slug: string) => products.find((product) => product.slug === slug);

export const productById = (id: number) => products.find((product) => product.id === id);

export const relatedProducts = (product: Product, count = 3) => {
  const others = products.filter((candidate) => candidate.id !== product.id);
  const start = (product.id * 3) % others.length;
  const picked = [...others.slice(start), ...others.slice(0, start)].slice(0, count);
  return picked.length === count ? picked : others.slice(0, count);
};
