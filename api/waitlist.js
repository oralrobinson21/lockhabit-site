// /api/waitlist.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// very light email format check
const looksLikeEmail = (s) => typeof s === 'string' && /\S+@\S+\.\S+/.test(s);

// (Optional) make sure Vercel JSON parsing didn't give us a string body
function ensureObjectBody(maybeBody) {
  if (!maybeBody) return {};
  if (typeof maybeBody === 'string') {
    try { return JSON.parse(maybeBody); } catch { return {}; }
  }
  return maybeBody;
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = ensureObjectBody(req.body);
    const { email, name = '', term = '' } = body;

    if (!looksLikeEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const from = process.env.RESEND_FROM;
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
      from,                // e.g. 'LockHabit <noreply@send.lockhabit.com>'
      to: email,           // send to the user (only)
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
