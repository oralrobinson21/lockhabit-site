import assert from "node:assert/strict";
import test from "node:test";
import { trackingLink } from "./shipping-tracking";

test("tracking links use approved carrier destinations", () => {
  assert.equal(trackingLink("USPS", "9400 1000 0000"), "https://tools.usps.com/go/TrackConfirmAction?tLabels=940010000000");
  assert.match(trackingLink("UPS", "1Z999AA10123456784"), /^https:\/\/www\.ups\.com\/track\?/);
  assert.match(trackingLink("FedEx", "123456789012"), /^https:\/\/www\.fedex\.com\/fedextrack\//);
  assert.match(trackingLink("DHL", "1234567890"), /^https:\/\/www\.dhl\.com\//);
});
test("carrier tracking rejects URL and script injection", () => {
  for (const input of ["http://evil.com", "javascript:alert(1)", "a?b#cdef", "", "a"]) {
    assert.throws(() => trackingLink("UPS", input));
  }
});
