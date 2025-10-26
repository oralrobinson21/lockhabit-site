// api/ping.js
export default async function handler(req, res) {
  res.status(200).json({
    ok: true,
    HAS_RESEND_KEY: !!process.env.RESEND_API_KEY,
    HAS_RESEND_FROM: !!process.env.RESEND_FROM
  });
}
