// /api/waitlist.js
// Vercel Serverless Function (Node 18+)
// - Stores waitlist entries in Supabase (unique by email)
// - Sends a best-effort confirmation email via Resend

const { createClient } = require('@supabase/supabase-js');

// --- ENV ---
const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const RESEND_API_KEY       = process.env.RESEND_API_KEY;

// Prefer a verified sender; fallback works without DNS setup.
const DEFAULT_FROM = 'LockHabit <onboarding@resend.dev>';
const FROM = process.env.RESEND_FROM || DEFAULT_FROM;

// --- Helpers ---
function supa() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

function isEmail(s = '') {
  return /^\S+@\S+\.\S+$/.test(s);
}

async function sendEmail(to, name) {
  if (!RESEND_API_KEY) return; // no-op if email disabled
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject: "You're on the LockHabit waitlist 🎉",
        text: `Hi ${name || ''},

Thanks for joining the LockHabit waitlist. We’ll email you when invites open.

— Team LockHabit`,
        html: `
          <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5">
            <h2>You're on the LockHabit waitlist 🎉</h2>
            <p>Hi ${name ? `<b>${name}</b>` : 'there'},</p>
            <p>Thanks for signing up. We'll email you when invites open.</p>
            <p style="color:#64748b">— Team LockHabit</p>
          </div>
        `,
      }),
    });
    // Ignore errors—signup should still succeed even if email fails
    await res.text().catch(() => {});
  } catch (_) { /* swallow */ }
}

// Vercel handler
module.exports = async (req, res) => {
  // --- CORS ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // --- Parse body ---
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const email = String(body?.email || '').trim().toLowerCase();
  const name  = String(body?.name  || '').trim().slice(0, 80) || null;
  const term  = String(body?.term  || '').trim().slice(0, 24) || null;

  if (!isEmail(email)) {
    return res.status(400).json({ ok: false, error: 'Invalid email' });
  }

  // --- DB client ---
  const db = supa();
  if (!db) {
    return res.status(500).json({ ok: false, error: 'DB not configured' });
  }

  try {
    // Upsert by email (requires UNIQUE(email) on public.waitlist)
    const { error } = await db
      .from('waitlist')
      .upsert({ email, name, term })
      .select('email')
      .single();

    if (error) throw error;

    // Fire-and-forget email (don’t block response)
    sendEmail(email, name).catch(() => {});

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('waitlist error:', e);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
};
