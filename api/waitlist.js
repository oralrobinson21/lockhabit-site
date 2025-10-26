// /api/waitlist.js  (ESM)
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple but solid email validator
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name = '', term = '' } = req.body || {};

    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    const from = process.env.RESEND_FROM; // e.g. 'LockHabit <noreply@send.lockhabit.com>'
    if (!from) {
      console.error('Missing RESEND_FROM');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    const html = `
      <h2>Welcome${name ? `, ${name}` : ''}!</h2>
      <p>You’re officially on the LockHabit waitlist.</p>
      ${term ? `<p>Your selected term: <strong>${term}</strong></p>` : ''}
      <p>We’ll notify you when early access opens. Stay disciplined.</p>
    `;

    const result = await resend.emails.send({
      from,
      to: email,
      // uncomment if you want an internal copy:
      // bcc: 'team@lockhabit.com',
      subject: 'LockHabit Waitlist Confirmation',
      html
    });

    if (result?.error) {
      console.error('Resend error:', result.error);
      return res.status(502).json({ error: 'Email provider rejected the request' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Email failed to send.' });
  }
}
