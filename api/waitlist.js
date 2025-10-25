// /api/waitlist.js
const { createClient } = require('@supabase/supabase-js');

let Resend; // lazy load so build doesn’t fail w/o package
try { Resend = require('resend').Resend; } catch {}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Method not allowed' });

  try {
    // ---- parse body ----
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
    let { email, name, term } = body || {};
    email = (email || '').trim().toLowerCase();
    name  = (name  || '').trim();
    term  = (term  || '').trim();

    // ---- validate ----
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!okEmail) return res.status(400).json({ ok:false, error:'Valid email required' });

    // ---- save to Supabase (upsert by email) ----
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { error: dbError } = await supabase
      .from('waitlist')
      .upsert([{ email, name, term, updated_at: new Date().toISOString() }], { onConflict: 'email' });
    if (dbError) return res.status(400).json({ ok:false, error: dbError.message });

    // ---- send welcome email (best-effort) ----
    try {
      if (Resend && process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const first = (name.split(' ')[0] || 'there');
        const html = `
          <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:16px;line-height:1.6">
            <h2>You're on the LockHabit waitlist 🎉</h2>
            <p>Hey ${first}, thanks for joining! We’ll email you when early access opens.</p>
            <p style="color:#64748b;font-size:13px;margin-top:20px">— The LockHabit team</p>
          </div>`;
        await resend.emails.send({
          from: 'LockHabit <onboarding@resend.dev>',
          to: email,
          subject: "You're on the LockHabit waitlist 🎉",
          html
        });
      }
    } catch (mailErr) {
      console.error('Email send error (ignored):', mailErr);
      // do not fail the request on email issues
    }

    return res.status(200).json({ ok:true });
  } catch (e) {
    console.error('Handler error:', e);
    return res.status(500).json({ ok:false, error: 'Server error' });
  }
};