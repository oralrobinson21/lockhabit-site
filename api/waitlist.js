// /api/waitlist.js
const { createClient } = require('@supabase/supabase-js');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// change to your verified sender (Resend → Domains or From addresses)
const FROM = 'LockHabit <noreply@your-verified-domain.com>';

function supa() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

async function sendEmail(to, name) {
  if (!RESEND_API_KEY) return;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject: 'You’re on the LockHabit waitlist 🎉',
        text: `Hi ${name || ''},

Thanks for joining the LockHabit waitlist. We’ll email you when invites open.

— Team LockHabit`,
        html: `
          <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5">
            <h2>You're on the LockHabit waitlist 🎉</h2>
            <p>Hi ${name ? `<b>${name}</b>` : 'there'},</p>
            <p>Thanks for signing up. We'll email you when invites open.</p>
            <p style="color:#64748b">— Team LockHabit</p>
          </div>`
      })
    });
    // best-effort; ignore failures so signup still succeeds
    await res.text().catch(()=>{});
  } catch {}
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Method not allowed' });

  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

    const email = String(body?.email || '').trim().toLowerCase();
    const name  = String(body?.name || '').trim().slice(0, 80) || null;
    const term  = String(body?.term || '').trim().slice(0, 24) || null;

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ ok:false, error:'Invalid email' });
    }

    const db = supa();
    if (!db) return res.status(500).json({ ok:false, error:'DB not configured' });

    // upsert by email (requires UNIQUE(email) which you added)
    const { error } = await db
      .from('waitlist')
      .upsert({ email, name, term })
      .select('email')
      .single();

    if (error) throw error;

    // fire-and-forget email
    sendEmail(email, name).catch(()=>{});

    return res.status(200).json({ ok:true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok:false, error:'Server error' });
  }
};
