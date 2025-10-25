// /api/pledge.js — pre-launch stub
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    // payload example: { email, name, pledge, ts }
    // later: write to your DB here
    return res.status(200).json({ ok: true });
  }
  return res.status(200).json({ ok: true, message: 'pledge API active' });
}