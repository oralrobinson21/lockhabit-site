// api/highscores/submit.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS / preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { name, score } = req.body || {};
    // basic validation (also enforced in DB with CHECK)
    if (
      typeof name !== 'string' ||
      typeof score !== 'number' ||
      !Number.isFinite(score) ||
      score < 0 || score > 200000
    ) {
      return res.status(400).json({ ok: false, error: 'Invalid payload' });
    }

    // sanitize name (max 24 chars, keep letters/numbers/space/_-)
    const clean = name
      .toString()
      .trim()
      .slice(0, 24)
      .replace(/[^a-zA-Z0-9 _-]/g, '') || 'anon';

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY // server-side key
    );

    const { error } = await supabase
      .from('highscores')
      .insert({ name: clean, score: Math.round(score) });

    if (error) throw error;
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(400).json({ ok: false, error: e.message || 'Insert failed' });
  }
}