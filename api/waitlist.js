const { createClient } = require('@supabase/supabase-js');

let Resend; // lazy-load so build doesn't fail if package not ready
try { Resend = require('resend').Resend; } catch {}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Method not allowed' });

  try {
    // Body (string or object)
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
    const { email, name, term } = body || {};
    if (!email || !email.includes('@')) return res.status(400).json({ ok:false, error:'Valid email required' });

    // Save to Supabase
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { error: dbError } = await supabase.from('waitlist').insert([{ email, name, term }]);
    if (dbError) return res.status(400).json({ ok:false, error: dbError.message });

    // Try to send email, but NEVER fail the request if it errors
    try {
      if (Resend && process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const firstName = (name || '').split(' ')[0] || 'there';
        const html = `
          <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:16px;line-height:1.6">
            <h2>You're on the LockHabit waitlist 🎉</h2>
            <p>Hey ${firstName}, thanks for joining! Once we're up and running, your saving and money management will be back on track.</p>
            <p>We’ll email you when early access opens.</p>
            <p style="color:#64748b;font-size:13px;margin-top:20px">— The LockHabit team</p>
          </div>
        `;
        await resend.emails.send({
          from: 'LockHabit <onboarding@resend.dev>',
          to: email,
          subject: "You're on the LockHabit waitlist 🎉",
          html
        });
      }
    } catch (mailErr) {
      console.error('Email send error (ignored):', mailErr);
      // Do not throw — we still return ok:true
    }

    return res.status(200).json({ ok:true });
  } catch (e) {
    console.error('Handler error:', e);
    return res.status(500).json({ ok:false, error: 'Server error' });
  }
};
