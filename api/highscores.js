// /api/highscores.js
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const PLACEHOLDERS = [
  { name: 'Nova',   score: 1280 },
  { name: 'Orion',  score: 990  },
  { name: 'Lyra',   score: 820  },
  { name: 'Vega',   score: 680  },
  { name: 'Atlas',  score: 540  },
];

function supa() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function hashIP(ip) {
  try { return crypto.createHash('sha256').update(ip || '').digest('hex').slice(0, 16); }
  catch { return null; }
}

function getIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    ''
  );
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = supa();

  if (req.method === 'GET') {
    try {
      let rows = [];
      if (db) {
        const { data, error } = await db
          .from('highscores')
          .select('name, score, created_at')
          .order('score', { ascending: false })
          .limit(20);
        if (error) throw error;
        rows = data || [];
      }
      // Merge: placeholders first, then real scores, then keep top 10 by score
      const merged = [...PLACEHOLDERS, ...rows].sort((a, b) => b.score - a.score).slice(0, 10);
      return res.status(200).json({ ok: true, top10: merged });
    } catch (e) {
      console.error(e);
      // Fallback to placeholders only
      return res.status(200).json({ ok: true, top10: PLACEHOLDERS });
    }
  }

  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
      const name = String((body?.name || 'anon')).trim().slice(0, 20) || 'anon';
      const score = Number(body?.score || 0) | 0;

      if (score <= 0 || score > 100000) {
        return res.status(400).json({ ok: false, error: 'Invalid score' });
      }

      const ip = getIP(req);
      const ipHash = hashIP(ip);
      const ua = (req.headers['user-agent'] || '').slice(0, 140);

      // very light rate limiting per IP: last 10 seconds
      if (db) {
        const since = new Date(Date.now() - 10_000).toISOString();
        const { data: recent, error: rErr } = await db
          .from('highscores')
          .select('id')
          .gte('created_at', since)
          .eq('ip_hash', ipHash)
          .limit(1);
        if (!rErr && recent && recent.length) {
          return res.status(429).json({ ok: false, error: 'Too many submissions' });
        }
      }

      if (db) {
        const { error } = await db.from('highscores').insert([{ name, score, ip_hash: ipHash, ua }]);
        if (error) throw error;
        return res.status(200).json({ ok: true });
      } else {
        // No DB configured — accept but not persisted
        return res.status(200).json({ ok: true, note: 'No DB configured; not persisted' });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({ ok: false, error: 'Server error' });
    }
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
};