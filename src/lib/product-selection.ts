export type SelectedOrderItem = {
  productId?: number;
  name: string;
  quantity: number;
  amountTotal: number;
};

const PRODUCT_DETAILS: Record<number, { name: string; unitPrice: number }> = {
  1: { name: "Coconut Beach Soap", unitPrice: 3500 },
  2: { name: "Breathe Clear Soap", unitPrice: 3500 },
  3: { name: "Aloe & Cool Cucumber Soap", unitPrice: 3500 },
  4: { name: "Slumber Soap", unitPrice: 3500 },
  5: { name: "Exfoliating Luffa Bar", unitPrice: 3500 },
  6: { name: "Lemongrass & Sage Soap", unitPrice: 3500 },
  7: { name: "Rich Sandalwood Soap", unitPrice: 3500 },
  8: { name: "Oat Milk Honey Soap", unitPrice: 3500 },
  9: { name: "Calming Lavender Soap", unitPrice: 3500 },
  10: { name: "Charcoal Soap", unitPrice: 3500 },
  11: { name: "Raw Shea Butter", unitPrice: 4200 },
  12: { name: "Kojic Acid & Turmeric Soap", unitPrice: 3500 },
};

export function parseSelectedProductIds(value: string | null | undefined): number[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isInteger(id) && PRODUCT_DETAILS[id]);
}

export function summarizeSelectedProducts(
  ids: number[],
  totalAmount: number,
): SelectedOrderItem[] {
  if (!ids.length) return [];

  const grouped = new Map<number, number>();
  for (const id of ids) grouped.set(id, (grouped.get(id) ?? 0) + 1);

  const entries = [...grouped.entries()].map(([id, quantity]) => ({
    id,
    quantity,
    detail: PRODUCT_DETAILS[id]!,
  }));
  const weightedTotal = entries.reduce(
    (sum, entry) => sum + entry.detail.unitPrice * entry.quantity,
    0,
  );

  let remaining = totalAmount;
  return entries.map((entry, index) => {
    const isLast = index === entries.length - 1;
    const amountTotal = isLast
      ? remaining
      : Math.round((totalAmount * entry.detail.unitPrice * entry.quantity) / weightedTotal);
    remaining -= amountTotal;
    return {
      productId: entry.id,
      name: entry.detail.name,
      quantity: entry.quantity,
      amountTotal,
    };
  });
}
