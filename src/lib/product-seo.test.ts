import assert from "node:assert/strict";
import test from "node:test";

import type { Product } from "@/lib/catalog";
import { productMeta, productStructuredData } from "@/lib/product-seo";

const coconut = {
  id: 1,
  slug: "coconut-beach-soap",
  name: "Coconut Beach Soap",
  note: "Coconut · Creamy · Tropical",
  price: 35,
  kind: "Soap bar",
  tagline: "A little vacation in every shower.",
  description:
    "A creamy coconut-scented soap with a warm tropical finish and a rich everyday lather.",
  productStory: "Made in the USA.",
  seoTitle: "Coconut Beach Soap – Coconut & Shea Butter Bar | LOCKHABIT",
  seoDescription:
    "A creamy 4 oz vegan coconut soap bar made with organic coconut, olive and palm oils plus organic shea butter. Warm tropical scent. Made in the USA.",
  madeIn: "USA",
  faqs: [
    { question: "Is it vegan?", answer: "Yes." },
    { question: "What is inside?", answer: "Organic oils and shea butter." },
    { question: "How do I use it?", answer: "Lather and rinse." },
    { question: "Where is it made?", answer: "USA." },
    { question: "Does it ship free?", answer: "Three bars ship free." },
  ],
  highlights: ["Warm coconut scent"],
  attributes: ["Vegan"],
  ingredients: ["Organic coconut oil"],
  productType: "Bar Soap",
  netWeight: "4 oz (113 g)",
  suggestedUse: "Lather.",
  warning: "Rinse eyes.",
  scene: { from: "#8ed7dd", to: "#f6d36b", motes: "#fffaf0" },
  images: [{ src: "/assets/coconut-beach-1.jpg", alt: "Front view" }],
} satisfies Product;

test("Coconut Beach search title names the bar and the oils people search", () => {
  const meta = productMeta(coconut);
  assert.equal(meta.title, "Coconut Beach Soap – Coconut & Shea Butter Bar | LOCKHABIT");
  assert.match(meta.description, /organic coconut, olive and palm oils/);
  assert.match(meta.description, /vegan/);
  assert.equal(meta.canonical, "https://lockhabit.com/soaps/coconut-beach-soap");
});

test("Coconut Beach structured data stays inside claims the page actually makes", () => {
  const graph = productStructuredData(coconut)["@graph"] as Array<{
    "@type": string;
    offers?: { price: string; shippingDetails: { shippingRate: { value: string } }[] };
    sku?: string;
    countryOfOrigin?: string;
    mainEntity?: unknown[];
  }>;
  const productNode = graph.find((node) => node["@type"] === "Product");
  const faq = graph.find((node) => node["@type"] === "FAQPage");
  assert.ok(productNode?.offers);
  assert.equal(productNode.offers.price, "35.00");
  assert.equal(productNode.sku, undefined, "Do not invent merchant SKUs");
  assert.equal(productNode.countryOfOrigin, "USA");
  assert.equal(productNode.offers.shippingDetails[1]?.shippingRate.value, "0");
  assert.ok(faq?.mainEntity);
  assert.equal(faq.mainEntity.length, 5);
  assert.equal("aggregateRating" in productNode, false);
});
