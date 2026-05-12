import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    res.json({
      status: "ok",
      database: "sqlite",
      uptime: process.uptime(),
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
}
