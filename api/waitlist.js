// /api/waitlist.js  (ESM)
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Vercel parses JSON automatically when header is set
    const { email, name = '', term = '' } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    const from = process.env.RESEND_FROM; // e.g. 'LockHabit <noreply@send.lockhabit.com>'
    if (!from) {
      console.error('Missing RESEND_FROM env var');
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
      subject: 'LockHabit Waitlist Confirmation',
      html
    });

    // surface provider errors if any
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
