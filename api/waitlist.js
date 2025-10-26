// api/waitlist.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // CORS for local tests (optional)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vercel parses JSON automatically if header is application/json
    const { email, name = '', term = '' } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Missing email' });

    const from = process.env.RESEND_FROM; // e.g. 'LockHabit <noreply@send.lockhabit.com>'
    if (!from) return res.status(500).json({ error: 'Server misconfiguration (RESEND_FROM missing)' });

    const html = `
      <h2>Welcome${name ? `, ${name}` : ''}!</h2>
      <p>You’re officially on the LockHabit waitlist.</p>
      ${term ? `<p>Your selected term: <strong>${term}</strong></p>` : ''}
      <p>We’ll notify you when early access opens.</p>
    `;

    const result = await resend.emails.send({
      from,
      to: email,
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
