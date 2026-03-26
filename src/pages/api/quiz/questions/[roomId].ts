import { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../../../lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { roomId } = req.query;
    try {
        const data = await redis.get(`quiz:room${roomId}`);
        if (!data) return res.status(404).json({ error: 'Room not found' });
        const questions = typeof data === 'string' ? JSON.parse(data) : data;
        return res.status(200).json({ questions });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch questions' });
    }
}
