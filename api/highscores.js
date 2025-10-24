// Serverless function stub for LockHabit demo leaderboard
export default async function handler(req, res) {
  // Basic CORS setup for safety
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET returns a fake top-10 list
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      top10: [
        { name: "Alex", score: 123 },
        { name: "Sam", score: 98 },
        { name: "Pat", score: 77 },
      ],
    });
  }

  // POST accepts new score
  if (req.method === "POST") {
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false, error: "Method not allowed" });
}