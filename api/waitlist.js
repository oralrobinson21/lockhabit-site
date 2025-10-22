const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

module.exports = async (req, res) => {
  // CORS for browser POSTs
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Method not allowed' });

  try {
    // Body parsing (Vercel may give string or object)
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    const { email, name, term } = body || {};
    if (!email || !email.includes('@')) {
      return res.status(400).json({ ok:false, error:'Valid email required' });
    }

    // 1) Save to Supabase
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { error: dbError } = await supabase.from('waitlist').insert([{ email, name, term }]);
    if (dbError) {
      console.error('Supabase insert error:', dbError);
      return res.status(400).json({ ok:false, error: dbError.message });
    }

    // 2) Send confirmation email to the user
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

    const sendResult = await resend.emails.send({
      from: 'LockHabit <onboarding@resend.dev>', // works without domain setup
      to: email,
      subject: "You're on the LockHabit waitlist 🎉",
      html
    });

    if (sendResult.error) {
      console.error('Resend send error:', sendResult.error);
      // We still return ok:true (the signup succeeded); you can decide to surface the mail error if you prefer
    }

    return res.status(200).json({ ok:true });
  } catch (e) {
    console.error('Handler error:', e);
    return res.status(400).json({ ok:false, error: e.message || 'Invalid data' });
  }
};
