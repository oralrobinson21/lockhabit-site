import { Resend } from 'resend';

export const config = { runtime: 'nodejs18.x' };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);

    const { email, name = '', term = '' } = body || {};
    if (!email) return res.status(400).json({ error: 'Missing email' });

    const FROM = process.env.RESEND_FROM;               // e.g. LockHabit <noreply@send.lockhabit.com>
    const API  = process.env.RESEND_API_KEY;            // re_********
    if (!FROM || !API) return res.status(500).json({ error: 'Missing envs' });

    const resend = new Resend(API);
    const result = await resend.emails.send({
      from: FROM,
      to: [email],
      subject: 'LockHabit Waitlist Confirmation',
      html: `
        <h2>Welcome${name ? `, ${name}` : ''}!</h2>
        <p>You’re officially on the LockHabit waitlist.</p>
        ${term ? `<p>Your selected term: <strong>${term}</strong></p>` : ''}
        <p>We’ll notify you when early access opens. Stay disciplined.</p>
      `
    });

    if (result?.error) return res.status(502).json({ error: result.error.message || 'Email failed' });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('waitlist error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
