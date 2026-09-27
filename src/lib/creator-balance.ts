/**
 * A partial refund on a commission that is still in its return hold creates an
 * immediate negative adjustment. Until the held commission is released, show that
 * deduction against the pending balance instead of as a negative available balance.
 */
export function creatorDisplayBalances(pendingCents: number, availableCents: number) {
  const pending = Number(pendingCents) || 0;
  const available = Number(availableCents) || 0;
  if (available >= 0) return { pendingCents: pending, availableCents: available };
  return { pendingCents: Math.max(0, pending + available), availableCents: 0 };
}

const ENTRY_LABELS: Record<string, string> = {
  commission: "Commission",
  refund_adjustment: "Refund adjustment",
  payout: "Payout",
  manual_adjustment: "Manual adjustment",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending (return hold)",
  available: "Available",
  paid: "Paid",
  reversed: "Reversed",
  requested: "Requested",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export const creatorEntryLabel = (value: string) => ENTRY_LABELS[value] ?? value;
export const creatorStatusLabel = (value: string) => STATUS_LABELS[value] ?? value;
