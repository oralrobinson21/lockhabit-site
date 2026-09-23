export const carriers = ["USPS", "UPS", "FedEx", "DHL"] as const;
export type Carrier = (typeof carriers)[number];

export function trackingLink(carrier: Carrier, number: string): string {
  const tracking = number.trim().replace(/\s+/g, "");
  if (!/^[A-Za-z0-9-]{6,80}$/.test(tracking)) throw new Error("Enter a valid tracking number.");
  const encoded = encodeURIComponent(tracking);
  switch (carrier) {
    case "USPS":
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encoded}`;
    case "UPS":
      return `https://www.ups.com/track?loc=en_US&tracknum=${encoded}`;
    case "FedEx":
      return `https://www.fedex.com/fedextrack/?trknbr=${encoded}`;
    case "DHL":
      return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${encoded}&submit=1`;
  }
}
