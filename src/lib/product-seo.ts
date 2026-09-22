import type { Product } from "@/lib/catalog";
import { FREE_SHIPPING_THRESHOLD, SINGLE_BAR_PRICE, THREE_BAR_BUNDLE_PRICE } from "@/lib/pricing";

const SITE = "https://lockhabit.com";

export const absoluteAssetUrl = (src: string) => new URL(src, SITE).href;

export const productCanonical = (product: Product) => `${SITE}/soaps/${product.slug}`;

export const productSku = (product: Product) =>
  `LOCKHABIT-${product.slug
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toUpperCase()}`;

export function productMeta(product: Product) {
  const title = product.seoTitle ?? `${product.name} | LOCKHABIT`;
  const description =
    product.seoDescription ??
    `${product.description} ${product.netWeight} ${product.productType.toLowerCase()}.`;
  const image = product.images[0]?.src
    ? absoluteAssetUrl(product.images[0].src)
    : `${SITE}/favicon.png`;

  return { title, description, image, canonical: productCanonical(product) };
}

const shippingDetails = [
  {
    "@type": "OfferShippingDetails",
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
    shippingRate: { "@type": "MonetaryAmount", value: "7.95", currency: "USD" },
    eligibleTransactionVolume: {
      "@type": "PriceSpecification",
      maxPrice: FREE_SHIPPING_THRESHOLD - 0.01,
      priceCurrency: "USD",
    },
  },
  {
    "@type": "OfferShippingDetails",
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
    shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "USD" },
    eligibleTransactionVolume: {
      "@type": "PriceSpecification",
      minPrice: FREE_SHIPPING_THRESHOLD,
      priceCurrency: "USD",
    },
  },
];

export function productStructuredData(product: Product) {
  const canonical = productCanonical(product);
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Product",
      "@id": `${canonical}#product`,
      name: product.name,
      description: product.productStory ?? product.description,
      image: product.images.map((image) => absoluteAssetUrl(image.src)),
      brand: { "@type": "Brand", name: "LOCKHABIT" },
      sku: productSku(product),
      category: product.productType,
      ...(product.madeIn ? { countryOfOrigin: product.madeIn } : {}),
      additionalProperty: (product.attributes ?? []).map((name) => ({
        "@type": "PropertyValue",
        name,
        value: "Yes",
      })),
      offers: {
        "@type": "Offer",
        url: canonical,
        priceCurrency: "USD",
        price: product.price.toFixed(2),
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        shippingDetails,
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "US",
          returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: 14,
          itemCondition: "https://schema.org/NewCondition",
          returnMethod: "https://schema.org/ReturnByMail",
        },
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: product.name, item: canonical },
      ],
    },
  ];

  if (product.faqs?.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${canonical}#faq`,
      mainEntity: product.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export const threeBarOffer = {
  price: THREE_BAR_BUNDLE_PRICE,
  savings: SINGLE_BAR_PRICE * 3 - THREE_BAR_BUNDLE_PRICE,
  freeShippingAt: FREE_SHIPPING_THRESHOLD,
};
