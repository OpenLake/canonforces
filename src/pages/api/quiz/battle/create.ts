import { NextApiRequest, NextApiResponse } from 'next';
import { nanoid } from 'nanoid';
import { redis } from '../../../../lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const roomId = nanoid(10); // Generate a 10-char room ID

    // Store this room ID in Redis with a 1-hour expiration
    // This isn't strictly necessary but is good practice to clean up old rooms
    await redis.set(`quiz:battle:room:${roomId}`, 'open', { ex: 3600 });

    res.status(200).json({ roomId });
  } catch (error) {
    console.error('Error creating battle room:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}