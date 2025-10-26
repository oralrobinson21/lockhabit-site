export default function handler(req, res) {
  const hasKey = (process.env.RESEND_API_KEY || '').startsWith('re_');
  const from = process.env.RESEND_FROM || '';
  res.status(200).json({
    ok: true,
    runtime: process.version,
    hasResendKey: hasKey,
    fromLooksOk: from.includes('<') && from.includes('>'),
    from
  });
}
