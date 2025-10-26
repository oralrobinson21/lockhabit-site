// /api/waitlist.js  (Vercel Serverless Function, Node runtime, ESM)
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Ensure Node runtime (NOT Edge)
export const config = { runtime: 'nodejs18.x' };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vercel parses JSON when header is set, but guard if body comes as string
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }

    const { email, name = '', term = '' } = body || {};
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    const FROM = process.env.RESEND_FROM; // e.g. 'LockHabit <noreply@send.lockhabit.com>'
    const API = process.env.RESEND_API_KEY;
    if (!FROM || !API) {
      console.error('Missing envs:', { hasFrom: !!FROM, hasApi: !!API });
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    const html = `
      <h2>Welcome${name ? `, ${name}` : ''}!</h2>
      <p>You’re officially on the LockHabit waitlist.</p>
      ${term ? `<p>Your selected term: <strong>${term}</strong></p>` : ''}
      <p>We’ll notify you when early access opens. Stay disciplined.</p>
    `;

    const result = await resend.emails.send({
      from: FROM,                 // MUST be verified, e.g. noreply@send.lockhabit.com
      to: [email],                // array is fine
      reply_to: 'support@lockhabit.com', // optional
      subject: 'LockHabit Waitlist Confirmation',
      html
    });

    if (result?.error) {
      // Resend SDK sometimes returns { error: { name, message, ... } }
      const msg = result.error?.message || JSON.stringify(result.error);
      console.error('❌ Resend error:', msg);
      return res.status(502).json({ error: msg || 'Email provider rejected the request' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('❌ Handler error:', err?.message || err);
    return res.status(500).json({ error: 'Email failed to send.' });
  }
}
