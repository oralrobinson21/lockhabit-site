// Vercel serverless function
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// simple email validator
function validEmail(e){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e||''); }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Method Not Allowed' });

  try {
    const { email, name = '', term = '' } = req.body || {};
    if (!validEmail(email)) return res.status(400).json({ ok:false, error:'Invalid email' });

    // 1) Notify you (internal)
    await resend.emails.send({
      from: 'LockHabit <noreply@send.lockhabit.com>',
      to: 'waitlist@lockhabit.com',              // <- change to your inbox
      subject: 'New waitlist signup',
      text: `Email: ${email}\nName: ${name}\nTerm: ${term}\nTime: ${new Date().toISOString()}`
    });

    // 2) Send confirmation to the user
    await resend.emails.send({
      from: 'LockHabit <noreply@send.lockhabit.com>',
      to: email,
      subject: 'Welcome to the LockHabit waitlist 🎉',
      headers: {
        // helps deliverability / compliance later
        'List-Unsubscribe': '<mailto:unsubscribe@send.lockhabit.com>'
      },
      html: `
        <div style="font-family:Inter,system-ui,sans-serif;font-size:16px;color:#0f172a">
          <h2>Thanks for joining!</h2>
          <p>We’ll email you when invites open. You’ll be the first to try it.</p>
          <p style="color:#64748b;font-size:12px">If this wasn’t you, ignore this message.</p>
        </div>`
    });

    res.status(200).json({ ok:true });
  } catch (err) {
    res.status(500).json({ ok:false, error: String(err && err.message || err) });
  }
}