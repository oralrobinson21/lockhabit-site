import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, term } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: [email, 'noreply@lockhabit.com'],
      subject: 'LockHabit Waitlist Confirmation',
      html: `
        <h2>Welcome, ${name}!</h2>
        <p>You’re officially on the LockHabit waitlist.</p>
        <p>Your selected term: <strong>${term}</strong></p>
        <p>We’ll notify you when early access opens. Stay disciplined!</p>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Email failed to send.' });
  }
}
