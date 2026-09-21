import coconutImage from "@/assets/soap-coconut.jpg";
import coconutPoolImage from "@/assets/coconut-gallery-pool.jpg";
import coconutDetailImage from "@/assets/coconut-gallery-detail.jpg";
import coconut2 from "@/assets/gallery/coconut-2.jpg";
import breatheImage from "@/assets/soap-breathe.jpg";
import breathe2 from "@/assets/gallery/breathe-2.jpg";
import breathe3 from "@/assets/gallery/breathe-3.jpg";
import breathe4 from "@/assets/gallery/breathe-4.jpg";
import aloeImage from "@/assets/soap-aloe-cucumber.jpg";
import aloe2 from "@/assets/gallery/aloe-2.jpg";
import aloe3 from "@/assets/gallery/aloe-3.jpg";
import aloe4 from "@/assets/gallery/aloe-4.jpg";
import slumberImage from "@/assets/soap-slumber.jpg";
import slumber2 from "@/assets/gallery/slumber-2.jpg";
import slumber3 from "@/assets/gallery/slumber-3.jpg";
import slumber4 from "@/assets/gallery/slumber-4.jpg";
import loofahImage from "@/assets/soap-loofah.jpg";
import luffa2 from "@/assets/gallery/luffa-2.jpg";
import luffa3 from "@/assets/gallery/luffa-3.jpg";
import luffa4 from "@/assets/gallery/luffa-4.jpg";
import lemongrassImage from "@/assets/soap-lemongrass.jpg";
import lemongrass2 from "@/assets/gallery/lemongrass-2.jpg";
import lemongrass3 from "@/assets/gallery/lemongrass-3.jpg";
import lemongrass4 from "@/assets/gallery/lemongrass-4.jpg";
import sandalwoodImage from "@/assets/soap-sandalwood.jpg";
import sandalwood2 from "@/assets/gallery/sandalwood-2.jpg";
import sandalwood3 from "@/assets/gallery/sandalwood-3.jpg";
import sandalwood4 from "@/assets/gallery/sandalwood-4.jpg";
import oatHoneyImage from "@/assets/soap-oat-honey.jpg";
import oatHoney2 from "@/assets/gallery/oat-honey-2.jpg";
import oatHoney3 from "@/assets/gallery/oat-honey-3.jpg";
import oatHoney4 from "@/assets/gallery/oat-honey-4.jpg";
import lavenderImage from "@/assets/soap-lavender.jpg";
import lavender2 from "@/assets/gallery/lavender-2.jpg";
import lavender3 from "@/assets/gallery/lavender-3.jpg";
import lavender4 from "@/assets/gallery/lavender-4.jpg";
import charcoalImage from "@/assets/soap-charcoal.jpg";
import charcoal2 from "@/assets/gallery/charcoal-2.jpg";
import charcoal3 from "@/assets/gallery/charcoal-3.jpg";
import charcoal4 from "@/assets/gallery/charcoal-4.jpg";
import sheaImage from "@/assets/shea-butter.jpg";
import shea2 from "@/assets/gallery/shea-2.jpg";
import shea3 from "@/assets/gallery/shea-3.jpg";
import shea4 from "@/assets/gallery/shea-4.jpg";
import turmericImage from "@/assets/soap-turmeric.jpg";
import turmeric2 from "@/assets/gallery/turmeric-2.jpg";
import turmeric3 from "@/assets/gallery/turmeric-3.jpg";
import turmeric4 from "@/assets/gallery/turmeric-4.jpg";

export type GalleryImage = { src: string; alt: string };

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
    tagline: "A slow morning by the water, in a bar.",
    description:
      "A creamy, sunlit cleanse inspired by slow mornings near the water. Coconut-rich lather leaves skin soft, fresh, and entirely unbothered by your calendar.",
    highlights: ["Creamy coconut lather", "Soft tropical scent", "Everyday gentle clean"],
    ingredients: [
      "Saponified organic extra virgin olive oil",
      "Organic palm oil",
      "Organic coconut oil",
      "Organic shea butter",
      "Fragrance",
    ],
    productType: "Botanical Bar Soap",
    netWeight: "4 oz (113 g)",
    suggestedUse: soapUse,
    warning: externalWarning,
    scene: { from: "#8ed7dd", to: "#f6d36b", motes: "#fffaf0" },
    images: [
      { src: coconutImage, alt: "LOCKHABIT Coconut Beach Soap on tropical rock by the ocean" },
      { src: coconut2, alt: "Coconut Beach Soap on wet volcanic rock with coconut and plumeria" },
      { src: coconutPoolImage, alt: "Coconut Beach Soap with unwrapped bar poolside by the ocean" },
      { src: coconutDetailImage, alt: "Close detail of LOCKHABIT Coconut Beach Soap label and texture" },
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
      { src: breatheImage, alt: "LOCKHABIT Breathe Clear Soap" },
      { src: breathe2, alt: "Breathe Clear Soap angled studio view showing label wrap" },
      { src: breathe3, alt: "Breathe Clear Soap with unwrapped cream bar beside labeled bar" },
      { src: breathe4, alt: "Breathe Clear Soap stacked with unwrapped bar in studio light" },
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
      { src: aloeImage, alt: "LOCKHABIT Aloe & Cool Cucumber Soap" },
      { src: aloe2, alt: "Aloe & Cool Cucumber Soap angled studio view of green-cream bar" },
      { src: aloe3, alt: "Aloe & Cool Cucumber Soap with second bar showing two-tone top" },
      { src: aloe4, alt: "Aloe & Cool Cucumber Soap standing with flat bar in studio light" },
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
      { src: slumberImage, alt: "LOCKHABIT Slumber Soap" },
      { src: slumber2, alt: "Slumber Soap angled studio view showing two-tone cream and purple" },
      { src: slumber3, alt: "Slumber Soap with unwrapped two-tone bar beside labeled bar" },
      { src: slumber4, alt: "Slumber Soap stacked over unwrapped bar in studio light" },
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
      { src: loofahImage, alt: "LOCKHABIT Exfoliating Luffa Bar" },
      { src: luffa2, alt: "Exfoliating Luffa Bar box beside stacked bars showing luffa mesh" },
      { src: luffa3, alt: "Exfoliating Luffa Bar with box and round bar from above" },
      { src: luffa4, alt: "Close view of natural luffa embedded in LOCKHABIT soap bars" },
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
      { src: lemongrassImage, alt: "LOCKHABIT Lemongrass & Sage Soap" },
      {
        src: lemongrass2,
        alt: "Lemongrass & Sage Soap angled studio view showing pale yellow bar",
      },
      { src: lemongrass3, alt: "Lemongrass & Sage Soap with unwrapped bar beside labeled bar" },
      { src: lemongrass4, alt: "Lemongrass & Sage Soap leaning on unwrapped bar in studio light" },
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
      { src: sandalwoodImage, alt: "LOCKHABIT Rich Sandalwood Soap" },
      { src: sandalwood2, alt: "Rich Sandalwood Soap angled studio view of cream bar and label" },
      { src: sandalwood3, alt: "Rich Sandalwood Soap with unwrapped bar beside labeled bar" },
      { src: sandalwood4, alt: "Rich Sandalwood Soap lying angled over unwrapped bar" },
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
      { src: oatHoneyImage, alt: "LOCKHABIT Oat Milk Honey Soap" },
      { src: oatHoney2, alt: "Oat Milk Honey Soap unwrapped bars showing oat texture" },
      { src: oatHoney3, alt: "Oat Milk Honey Soap bars in clear wrap leaning together" },
      { src: oatHoney4, alt: "Oat Milk Honey Soap angled studio view of wrapped bar" },
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
      { src: lavenderImage, alt: "LOCKHABIT Calming Lavender Soap" },
      { src: lavender2, alt: "Calming Lavender Soap angled studio view of flecked cream bar" },
      { src: lavender3, alt: "Calming Lavender Soap with unwrapped bar beside labeled bar" },
      { src: lavender4, alt: "Calming Lavender Soap stacked over unwrapped bar in studio light" },
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
      { src: charcoalImage, alt: "LOCKHABIT Charcoal Soap" },
      { src: charcoal2, alt: "Charcoal Soap angled studio view of black bar and label" },
      { src: charcoal3, alt: "Charcoal Soap in clear wrap leaning on second bar" },
      { src: charcoal4, alt: "Charcoal Soap snapped open showing dense black interior" },
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
      { src: sheaImage, alt: "LOCKHABIT Raw Shea Butter" },
      {
        src: shea2,
        alt: "Raw Shea Butter jar balanced on a fist in studio light",
      },
      { src: shea3, alt: "Hand holding tilted LOCKHABIT Raw Shea Butter jar" },
      { src: shea4, alt: "Open jar of creamy LOCKHABIT Raw Shea Butter held in hand" },
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
      { src: turmericImage, alt: "LOCKHABIT Kojic Acid & Turmeric Soap" },
      { src: turmeric2, alt: "Turmeric soap with broken bar showing speckled golden texture" },
      { src: turmeric3, alt: "Kojic Acid & Turmeric Soap with unwrapped bar in studio light" },
      { src: turmeric4, alt: "Two LOCKHABIT Turmeric Soap bars angled in studio light" },
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
