// /api/waitlist.js  (Vercel serverless function, CommonJS)
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM || 'LockHabit <noreply@send.lockhabit.com>';

function validEmail(e){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e||''); }

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok:false, error:'Method Not Allowed' });
  }

  try {
    const { email, name = '', term = '' } = req.body || {};
    if (!validEmail(email)) return res.status(400).json({ ok:false, error:'Invalid email' });

    // 1) Send you a notification
    await resend.emails.send({
      from: FROM,
      to: 'waitlist@lockhabit.com',     // change to your inbox
      subject: 'New waitlist signup',
      text: `Email: ${email}\nName: ${name}\nTerm: ${term}\nTime: ${new Date().toISOString()}`
    });

    // 2) Confirmation to the user
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Welcome to the LockHabit waitlist 🎉',
      headers: { 'List-Unsubscribe': '<mailto:unsubscribe@send.lockhabit.com>' },
      html: `
        <div style="font-family:Inter,system-ui,sans-serif;font-size:16px;color:#0f172a">
          <h2>Thanks for joining!</h2>
          <p>We’ll email you when invites open. You’ll be the first to try it.</p>
          <p style="color:#64748b;font-size:12px">If this wasn’t you, just ignore this message.</p>
        </div>`
    });

    return res.status(200).json({ ok:true });
  } catch (err) {
    return res.status(500).json({ ok:false, error: String(err && err.message || err) });
  }
};