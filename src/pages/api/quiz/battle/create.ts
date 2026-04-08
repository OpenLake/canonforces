import { NextApiRequest, NextApiResponse } from 'next';
import { nanoid } from 'nanoid';
import { redis } from '../../../../lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
        const { topic, difficulty, count } = req.body;
        const roomId = nanoid(10);
        
        if (!roomId) {
            throw new Error('Failed to generate a valid roomId');
        }

        console.log(`[API_BATTLE_CREATE] Creating room: ${roomId} for topic: ${topic}`);

        await redis.set(`quiz:lobby:${roomId}`, JSON.stringify({ 
            topic: topic || 'DSA', 
            difficulty: difficulty || 'medium', 
            count: count || 5,
            createdAt: Date.now() 
        }), { ex: 3600 });

        return res.status(200).json({ roomId });
    } catch (error: any) {
        console.error('[API_BATTLE_CREATE] Error creating room:', error.message || error);
        return res.status(500).json({ error: error.message || 'Failed to create room. Please ensure Redis is configured.' });
    }
}
