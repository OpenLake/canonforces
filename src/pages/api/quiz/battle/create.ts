import { NextApiRequest, NextApiResponse } from 'next';
import { nanoid } from 'nanoid';
import { redis } from '../../../../lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
        const roomId = nanoid(10);
        await redis.set(`quiz:lobby:${roomId}`, JSON.stringify({ createdAt: Date.now() }), { ex: 3600 });
        return res.status(200).json({ roomId });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create room' });
    }
}
