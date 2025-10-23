// api/highscores/submit.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Method not allowed' });

  try {
    const { name, score } = req.body || {};
    if (!name || typeof score !== 'number') {
      return res.status(400).json({ ok:false, error:'name (string) and score (number) required' });
    }

    const cleanName = String(name).slice(0, 24).trim();
    const safeScore = Math.max(0, Math.min(200000, Math.floor(score)));

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    const { error } = await supabase
      .from('highscores')
      .insert([{ name: cleanName || 'Player', score: safeScore }]);

    if (error) throw error;
    return res.status(200).json({ ok:true });
  } catch (e) {
    return res.status(500).json({ ok:false, error: e.message || 'Server error' });
  }
}