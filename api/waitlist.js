const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Method not allowed' });

  try {
    const { email, name, term } = req.body || {};
    if (!email || !email.includes('@')) return res.status(400).json({ ok:false, error:'Valid email required' });

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { error } = await supabase.from('waitlist').insert({ email, name, term });
    if (error) return res.status(400).json({ ok:false, error: error.message });

    return res.status(200).json({ ok:true });
  } catch (e) {
    return res.status(400).json({ ok:false, error: e.message || 'Invalid data' });
  }
};
