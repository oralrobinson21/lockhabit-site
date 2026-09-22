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

const standardFeaturedAttributes = ["Cruelty free", "Vegan", "100% natural", "Paraben free"];

const coconutFeaturedAttributes = ["Vegan", "Non-GMO", "Paraben free", "Sulfate free"];

const coconutSupplierAttributes = [
  "Alcohol free",
  "Mineral oil free",
  "Phthalate free",
  "Silicone free",
];

const breatheSupplierAttributes = [
  "Gluten free",
  "Vegetarian",
  "Lactose free",
  "Allergen free",
  "Hormone free",
  "100% natural",
  "Antibiotic free",
  "No fillers",
  "Corn free",
  "Vegan",
  "Alcohol free",
  "Cruelty free",
  "Fragrance free",
  "Mineral oil free",
  "Paraben free",
  "Phthalate free",
  "Silicone free",
  "Sulfate free",
];

const fullSoapSupplierAttributes = [
  "Gluten free",
  "Vegetarian",
  "Lactose free",
  "Allergen free",
  "Hormone free",
  "100% natural",
  "Antibiotic free",
  "No fillers",
  "Non-GMO",
  "Corn free",
  "Vegan",
  "Alcohol free",
  "Cruelty free",
  "Mineral oil free",
  "Paraben free",
  "Phthalate free",
  "Silicone free",
  "Sulfate free",
];

const fullSoapFragranceFreeSupplierAttributes = [
  ...fullSoapSupplierAttributes.slice(0, 13),
  "Fragrance free",
  ...fullSoapSupplierAttributes.slice(13),
];

const slumberSupplierAttributes = [
  "Gluten free",
  "Vegetarian",
  "Lactose free",
  "Allergen free",
  "Hormone free",
  "100% natural",
  "Antibiotic free",
  "Non-GMO",
  "Vegan",
  "Alcohol free",
  "Cruelty free",
  "Fragrance free",
  "Mineral oil free",
  "Paraben free",
  "Phthalate free",
  "Silicone free",
  "Sulfate free",
];

const luffaSupplierAttributes = [
  "Gluten free",
  "Vegetarian",
  "Lactose free",
  "Allergen free",
  "Hormone free",
  "100% natural",
  "Antibiotic free",
  "No fillers",
  "Non-GMO",
  "Vegan",
  "Alcohol free",
  "Cruelty free",
  "Fragrance free",
  "Mineral oil free",
  "Paraben free",
  "Phthalate free",
  "Silicone free",
  "Sulfate free",
];

const oatHoneyFeaturedAttributes = ["Cruelty free", "100% natural", "Paraben free", "Sulfate free"];

const oatHoneySupplierAttributes = [
  "Gluten free",
  "100% natural",
  "Antibiotic free",
  "No fillers",
  "Alcohol free",
  "Cruelty free",
  "Mineral oil free",
  "Paraben free",
  "Phthalate free",
  "Silicone free",
  "Sulfate free",
];

const rawSheaFeaturedAttributes = ["Cruelty free", "Vegan", "100% natural", "Fragrance free"];

const rawSheaSupplierAttributes = [
  "Gluten free",
  "Vegetarian",
  "Lactose free",
  "Hormone free",
  "100% natural",
  "Antibiotic free",
  "No fillers",
  "Non-GMO",
  "Vegan",
  "Alcohol free",
  "Cruelty free",
  "Fragrance free",
  "Mineral oil free",
  "Paraben free",
  "Phthalate free",
  "Silicone free",
  "Sulfate free",
];

const kojicFeaturedAttributes = ["Cruelty free", "100% natural", "Non-GMO", "Paraben free"];

const kojicSupplierAttributes = [
  "Vegetarian",
  "100% natural",
  "No fillers",
  "Non-GMO",
  "Cruelty free",
  "Fragrance free",
  "Paraben free",
  "Phthalate free",
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
    allAttributes: ["Gluten free", "Vegetarian", "Lactose free", "Fair trade palm oil", "Fair trade coconut oil"],
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
    note: "Polishing · Fresh · Spa-like",
    price: 35,
    kind: "Soap bar",
    tagline: "Scrub and soap in one piece.",
    description:
      "A natural loofah is set right into the bar, so you lather and buff in one motion. Great on elbows, knees, feet, and anywhere that likes a little friction.",
    highlights: ["Built-in natural loofah", "Buffs while it cleans", "Long-lasting bar"],
    ingredients: [
      "Saponified organic extra virgin olive oil",
      "Organic coconut oil",
      "Organic palm oil",
      "Natural luffa",
      "Grapefruit essential oil",
      "Tea tree essential oil",
      "Cocoa butter",
      "Shea butter",
      "Mango butter",
      "Fragrance",
    ],
    productType: "Exfoliating Botanical Bar",
    netWeight: "4 oz (113 g)",
    suggestedUse: exfoliatingUse,
    warning: externalWarning,
    attributes: standardFeaturedAttributes,
    allAttributes: luffaSupplierAttributes,
    scene: { from: "#f0dcae", to: "#8ed7dd", motes: "#fffdf4" },
    images: [
      { src: luffaReal1, alt: "Real LOCKHABIT exfoliating luffa boxed front view" },
      { src: luffaReal2, alt: "Real LOCKHABIT exfoliating luffa box and round bars" },
      { src: luffaReal3, alt: "Real LOCKHABIT exfoliating luffa box and round bar view" },
      { src: luffaReal4, alt: "Real LOCKHABIT exfoliating luffa cut luffa texture view" },
    ],
  },
  {
    id: 6,
    slug: "lemongrass-sage-soap",
    name: "Lemongrass & Sage Soap",
    note: "Citrusy · Herbal · Fresh",
    price: 35,
    kind: "Soap bar",
    tagline: "A bright herbal wake-up call.",
    description:
      "Citrusy lemongrass with a dry, green sage finish. This is the morning bar — sharp enough to start the day, soft enough to use every day.",
    highlights: ["Bright citrus lift", "Herbal sage finish", "Great morning bar"],
    ingredients: [
      "Saponified organic extra virgin olive oil",
      "Organic coconut oil",
      "Organic palm oil",
      "Organic shea butter",
      "Lemongrass essential oil",
      "Sage essential oil",
      "Natural fragrance",
    ],
    productType: "Botanical Bar Soap",
    netWeight: "4 oz (113 g)",
    suggestedUse: soapUse,
    warning: externalWarning,
    attributes: standardFeaturedAttributes,
    allAttributes: fullSoapSupplierAttributes,
    scene: { from: "#d9e88f", to: "#f6d36b", motes: "#ffffff" },
    images: [
      { src: lemongrassReal1, alt: "Real LOCKHABIT lemongrass sage front view" },
      { src: lemongrassReal2, alt: "Real LOCKHABIT lemongrass sage three-quarter view" },
      { src: lemongrassReal3, alt: "Real LOCKHABIT lemongrass sage unwrapped bar view" },
      { src: lemongrassReal4, alt: "Real LOCKHABIT lemongrass sage paired bar view" },
    ],
  },
  {
    id: 7,
    slug: "rich-sandalwood-soap",
    name: "Rich Sandalwood Soap",
    note: "Warm · Earthy · Luxurious",
    price: 35,
    kind: "Soap bar",
    tagline: "Warm wood, low light, no rush.",
    description:
      "Deep and grounding, with the soft warmth of sandalwood. The bar to reach for when you want your shower to feel like a quiet room.",
    highlights: ["Warm woody scent", "Grounding and smooth", "Unisex favorite"],
    ingredients: [
      "Saponified organic extra virgin olive oil",
      "Organic palm oil",
      "Organic coconut oil",
      "Organic shea butter",
      "Sandalwood essential oil",
      "Botanical extracts",
      "Fragrance",
    ],
    productType: "Botanical Bar Soap",
    netWeight: "4 oz (113 g)",
    suggestedUse: soapUse,
    warning: externalWarning,
    attributes: standardFeaturedAttributes,
    allAttributes: fullSoapSupplierAttributes,
    scene: { from: "#c68a5a", to: "#f0c98a", motes: "#ffeccd" },
    images: [
      { src: sandalwoodReal1, alt: "Real LOCKHABIT rich sandalwood front view" },
      { src: sandalwoodReal2, alt: "Real LOCKHABIT rich sandalwood three-quarter view" },
      { src: sandalwoodReal3, alt: "Real LOCKHABIT rich sandalwood unwrapped bar view" },
      { src: sandalwoodReal4, alt: "Real LOCKHABIT rich sandalwood paired bar view" },
    ],
  },
  {
    id: 8,
    slug: "oat-milk-honey-soap",
    name: "Oat Milk Honey Soap",
    note: "Oat · Honey · Nourishing",
    price: 35,
    kind: "Soap bar",
    tagline: "The softest bar in the drawer.",
    description:
      "Oats and honey make a mild, creamy lather that suits sensitive and dry skin. Comforting, barely scented, and very hard to put down.",
    highlights: ["Gentle oat lather", "Soft honey sweetness", "Kind to dry skin"],
    ingredients: [
      "Saponified organic extra virgin olive oil",
      "Organic coconut oil",
      "Organic palm oil",
      "Organic shea butter",
      "Oat milk powder",
      "Honey",
      "Colloidal oats",
      "Fragrance",
    ],
    productType: "Botanical Bar Soap",
    netWeight: "4 oz (113 g)",
    suggestedUse: soapUse,
    warning: externalWarning,
    attributes: oatHoneyFeaturedAttributes,
    allAttributes: oatHoneySupplierAttributes,
    scene: { from: "#f3dcae", to: "#fff3d2", motes: "#fffdf6" },
    images: [
      { src: oatHoneyReal1, alt: "Real LOCKHABIT oat honey front view" },
      { src: oatHoneyReal2, alt: "Real LOCKHABIT oat honey bar and packaging view" },
      { src: oatHoneyReal3, alt: "Real LOCKHABIT oat honey paired bar view" },
      { src: oatHoneyReal4, alt: "Real LOCKHABIT oat honey three-quarter view" },
    ],
  },
  {
    id: 9,
    slug: "calming-lavender-soap",
    name: "Calming Lavender Soap",
    note: "Soft · Floral · Calming",
    price: 35,
    kind: "Soap bar",
    tagline: "Classic lavender, done properly.",
    description:
      "Real lavender buds and a soft floral scent make this the calmest bar in the catalog. Lovely at night, still lovely at 7am.",
    highlights: ["True lavender scent", "Real lavender buds", "Calming and familiar"],
    ingredients: [
      "Saponified organic extra virgin olive oil",
      "Organic coconut oil",
      "Organic palm oil",
      "Organic shea butter",
      "Colloidal oatmeal",
      "Lavender essential oil",
      "Botanical extracts",
      "Fragrance",
    ],
    productType: "Botanical Bar Soap",
    netWeight: "4 oz (113 g)",
    suggestedUse: soapUse,
    warning: externalWarning,
    attributes: standardFeaturedAttributes,
    allAttributes: fullSoapFragranceFreeSupplierAttributes,
    scene: { from: "#b9a6dd", to: "#e8def7", motes: "#fdfbff" },
    images: [
      { src: lavenderReal1, alt: "Real LOCKHABIT calming lavender front view" },
      { src: lavenderReal2, alt: "Real LOCKHABIT calming lavender three-quarter view" },
      { src: lavenderReal3, alt: "Real LOCKHABIT calming lavender unwrapped bar view" },
      { src: lavenderReal4, alt: "Real LOCKHABIT calming lavender paired bar view" },
    ],
  },
  {
    id: 10,
    slug: "charcoal-soap",
    name: "Charcoal Soap",
    note: "Purifying · Bold · Spa Clean",
    price: 35,
    kind: "Soap bar",
    tagline: "The reset button for your skin.",
    description:
      "Activated charcoal gives a deep, fresh-feeling cleanse. A good choice for oily skin, gym days, and faces that need a proper rinse.",
    highlights: ["Deep charcoal cleanse", "Fresh mineral finish", "Good for oily skin"],
    ingredients: [
      "Saponified organic extra virgin olive oil",
      "Organic palm oil",
      "Organic coconut oil",
      "Organic shea butter",
      "Activated charcoal",
      "Tea tree essential oil",
      "Botanical oils",
      "Fragrance",
    ],
    productType: "Botanical Bar Soap",
    netWeight: "4 oz (113 g)",
    suggestedUse: soapUse,
    warning: externalWarning,
    attributes: standardFeaturedAttributes,
    allAttributes: fullSoapFragranceFreeSupplierAttributes,
    scene: { from: "#5c6169", to: "#b8c1c8", motes: "#ffffff" },
    images: [
      { src: charcoalReal1, alt: "Real LOCKHABIT charcoal front view" },
      { src: charcoalReal2, alt: "Real LOCKHABIT charcoal three-quarter view" },
      { src: charcoalReal3, alt: "Real LOCKHABIT charcoal paired bar view" },
      { src: charcoalReal4, alt: "Real LOCKHABIT charcoal broken bar texture view" },
    ],
  },
  {
    id: 11,
    slug: "raw-shea-butter",
    name: "Raw Shea Butter",
    note: "Nourishing · Velvety · Rich",
    price: 42,
    kind: "Body care",
    tagline: "Straight from the nut, nothing added.",
    description:
      "Unrefined, deeply rich shea butter for dry patches, elbows, ends of hair, and everything the weather has been unkind to. A little goes a long way.",
    highlights: ["Unrefined and rich", "Melts on contact", "One ingredient, many uses"],
    ingredients: ["100% pure, unrefined raw shea butter (Butyrospermum Parkii)", "Nothing else"],
    productType: "Ultra-Rich Body Butter",
    netWeight: "8 oz (226 g)",
    suggestedUse:
      "Scoop a small amount and warm between hands. Massage onto skin, focusing on dry areas. Use daily for soft, nourished skin.",
    warning: externalWarning,
    attributes: rawSheaFeaturedAttributes,
    allAttributes: rawSheaSupplierAttributes,
    scene: { from: "#e8d3a8", to: "#fff6e2", motes: "#fffdf7" },
    images: [
      { src: sheaReal1, alt: "Real LOCKHABIT raw shea jar front view" },
      { src: sheaReal2, alt: "Real LOCKHABIT raw shea jar held upright" },
      { src: sheaReal3, alt: "Real LOCKHABIT raw shea jar held at an angle" },
      { src: sheaReal4, alt: "Real LOCKHABIT raw shea open jar view" },
    ],
  },
  {
    id: 12,
    slug: "kojic-acid-turmeric-soap",
    name: "Kojic Acid & Turmeric Soap",
    note: "Golden · Citrus · Radiant",
    price: 35,
    kind: "Soap bar",
    tagline: "Golden, bright, and a little bit glowy.",
    description:
      "Turmeric and kojic acid in a golden bar made for an even, fresh-looking finish. Use it a few times a week and follow with moisturiser.",
    highlights: ["Golden turmeric bar", "Brightening routine", "Citrus-warm scent"],
    ingredients: [
      "Saponified organic extra virgin olive oil",
      "Organic palm oil",
      "Organic coconut oil",
      "Organic shea butter",
      "Kojic acid",
      "Turmeric",
      "Lemon extract",
      "Fragrance",
    ],
    productType: "Botanical Bar Soap",
    netWeight: "4 oz (113 g)",
    suggestedUse: soapUse,
    warning: externalWarning,
    attributes: kojicFeaturedAttributes,
    allAttributes: kojicSupplierAttributes,
    scene: { from: "#f2b13c", to: "#ffe08a", motes: "#fff8e3" },
    images: [
      { src: turmericReal1, alt: "Real LOCKHABIT kojic turmeric front view" },
      { src: turmericReal2, alt: "Real LOCKHABIT kojic turmeric packaged and unwrapped view" },
      { src: turmericReal3, alt: "Real LOCKHABIT kojic turmeric three-bar view" },
      { src: turmericReal4, alt: "Real LOCKHABIT kojic turmeric stacked bar view" },
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
