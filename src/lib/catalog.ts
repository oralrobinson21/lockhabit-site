import coconutReal1 from "@/assets/real-products/coconut-beach-1.jpg";
import coconutReal2 from "@/assets/real-products/coconut-beach-2.jpg";
import coconutReal3 from "@/assets/real-products/coconut-beach-3.jpg";
import coconutReal4 from "@/assets/real-products/coconut-beach-4.jpg";
import coconutLifestyle from "@/assets/generated-products/coconut-beach-lifestyle.webp";
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

export const products: Product[] = [
  {
    id: 1,
    slug: "coconut-beach-soap",
    name: "Coconut Beach Soap",
    note: "Coconut · Creamy · Tropical",
    price: 35,
    kind: "Soap bar",
    tagline: "Coconut without the boarding pass.",
    description:
      "A creamy coconut-scented bar made with saponified organic olive, palm and coconut oils plus shea butter. Add warm water, work up a good lather, and give yourself five quiet minutes — ocean view optional.",
    highlights: ["Creamy coconut scent", "Olive, coconut + shea base", "4 oz everyday bar"],
    productStory:
      "Coconut Beach is the shower version of putting your phone on Do Not Disturb. The formula keeps things straightforward: a saponified blend of organic extra virgin olive oil, organic palm oil, organic coconut oil and organic shea butter, finished with fragrance for that warm coconut-beach mood.",
    attributes: [
      "Vegan",
      "Non-GMO",
      "Paraben free",
      "Sulfate free",
      "Silicone free",
      "Phthalate free",
      "Mineral oil free",
      "Alcohol free",
    ],
    allAttributes: [
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
      "Mineral oil free",
      "Paraben free",
      "Phthalate free",
      "Silicone free",
      "Sulfate free",
    ],
    ingredients: [
      "Saponified organic extra virgin olive oil",
      "Organic palm oil",
      "Organic coconut oil",
      "Organic shea butter",
      "Fragrance",
    ],
    productType: "Botanical Bar Soap",
    netWeight: "4 oz (113 g)",
    suggestedUse:
      "Add warm water for a thick lather. Keep the bar dry between uses to help it last longer.",
    warning:
      "In case of accidental contact with eyes, rinse thoroughly with clean water. If irritation occurs, discontinue use.",
    scene: { from: "#8ed7dd", to: "#f6d36b", motes: "#fffaf0" },
    images: [
      { src: coconutReal1, alt: "Real LOCKHABIT Coconut Beach Soap front view" },
      {
        src: coconutLifestyle,
        crop: "top-left",
        illustrative: true,
        alt: "Illustrative Coconut Beach tropical product scene by the ocean",
      },
      {
        src: coconutLifestyle,
        crop: "top-right",
        illustrative: true,
        alt: "Illustrative Coconut Beach soap scene beside a tropical shower",
      },
      {
        src: coconutLifestyle,
        crop: "bottom-left",
        illustrative: true,
        alt: "Illustrative Coconut Beach shower ritual with a lathered soap bar",
      },
      {
        src: coconutLifestyle,
        crop: "bottom-right",
        illustrative: true,
        alt: "Illustrative Coconut Beach wrapped and unwrapped soap ritual scene",
      },
      { src: coconutReal2, alt: "Real LOCKHABIT Coconut Beach Soap three-quarter view" },
      { src: coconutReal3, alt: "Real LOCKHABIT Coconut Beach Soap unwrapped bar view" },
      { src: coconutReal4, alt: "Real LOCKHABIT Coconut Beach Soap paired bar view" },
    ],
  },
  {
    id: 2,
    slug: "breathe-clear-soap",
    name: "Breathe Clear Soap",
    note: "Minty · Crisp · Uplifting",
    price: 35,
    kind: "Soap bar",
    tagline: "A cool, wide-open breath in the shower.",
    description:
      "Eucalyptus and mint make this one feel like opening a window. Best used in a steamy shower, when you want your head to clear as fast as your skin.",
    highlights: ["Cooling eucalyptus", "Fresh mint finish", "Made for steamy showers"],
    ingredients: [
      "Saponified organic extra virgin olive oil",
      "Organic coconut oil",
      "Organic shea butter",
      "Eucalyptus essential oil",
      "Peppermint essential oil",
      "Lemon essential oil",
      "Thyme essential oil",
      "Fragrance",
    ],
    productType: "Botanical Bar Soap",
    netWeight: "4 oz (113 g)",
    suggestedUse: soapUse,
    warning: externalWarning,
    scene: { from: "#bfe6dd", to: "#eaf3c9", motes: "#ffffff" },
    images: [
      { src: breatheReal1, alt: "Real LOCKHABIT breathe clear front view" },
      { src: breatheReal2, alt: "Real LOCKHABIT breathe clear three-quarter view" },
      { src: breatheReal3, alt: "Real LOCKHABIT breathe clear unwrapped bar view" },
      { src: breatheReal4, alt: "Real LOCKHABIT breathe clear stacked bar view" },
    ],
  },
  {
    id: 3,
    slug: "aloe-cool-cucumber-soap",
    name: "Aloe & Cool Cucumber Soap",
    note: "Cool · Hydrating · Fresh",
    price: 35,
    kind: "Soap bar",
    tagline: "Cold-drink freshness for warm skin.",
    description:
      "Aloe and cucumber team up for a calm, cooling wash. A good pick after sun, after sport, or after any day that ran a little hot.",
    highlights: ["Cooling cucumber", "Soothing aloe", "Light, clean scent"],
    ingredients: [
      "Saponified organic extra virgin olive oil",
      "Organic coconut oil",
      "Organic palm oil",
      "Organic shea butter",
      "Aloe vera",
      "Cucumber extract",
      "Botanical oils",
      "Fragrance",
    ],
    productType: "Botanical Bar Soap",
    netWeight: "4 oz (113 g)",
    suggestedUse: soapUse,
    warning: externalWarning,
    scene: { from: "#a9e2c8", to: "#d9f0f6", motes: "#f2fff6" },
    images: [
      { src: aloeReal1, alt: "Real LOCKHABIT aloe cucumber front view" },
      { src: aloeReal2, alt: "Real LOCKHABIT aloe cucumber three-quarter view" },
      { src: aloeReal3, alt: "Real LOCKHABIT aloe cucumber unwrapped bar view" },
      { src: aloeReal4, alt: "Real LOCKHABIT aloe cucumber paired bar view" },
    ],
  },
  {
    id: 4,
    slug: "slumber-soap",
    name: "Slumber Soap",
    note: "Soothing · Restful · Woodsy",
    price: 35,
    kind: "Soap bar",
    tagline: "The last warm thing before bed.",
    description:
      "A quiet, woody-floral bar for the end of the day. Made for long night showers, dim bathrooms, and the part of the evening where nothing else is urgent.",
    highlights: ["Calm evening scent", "Soft, low lather", "Part of a wind-down routine"],
    ingredients: [
      "Saponified organic extra virgin olive oil",
      "Organic coconut oil",
      "Organic palm oil",
      "Organic shea butter",
      "Pine needle essential oil",
      "Lavender essential oil",
      "Botanical extracts",
      "Fragrance",
    ],
    productType: "Botanical Bar Soap",
    netWeight: "4 oz (113 g)",
    suggestedUse: soapUse,
    warning: externalWarning,
    scene: { from: "#9aa8a1", to: "#cfc3d8", motes: "#f6f2ff" },
    images: [
      { src: slumberReal1, alt: "Real LOCKHABIT slumber front view" },
      { src: slumberReal2, alt: "Real LOCKHABIT slumber three-quarter view" },
      { src: slumberReal3, alt: "Real LOCKHABIT slumber unwrapped bar view" },
      { src: slumberReal4, alt: "Real LOCKHABIT slumber stacked bar view" },
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
