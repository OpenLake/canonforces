import { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../../../lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { roomId } = req.query;

    // Long polling: wait for up to 60 seconds for the questions to appear
    let attempts = 0;
    while (attempts < 120) {
        try {
            const data = await redis.get(`quiz:room:${roomId}`);
            if (data) {
                console.log(`[QUESTIONS_API] Success for room ${roomId} on attempt ${attempts}`);
                const questions = typeof data === 'string' ? JSON.parse(data) : data;
                return res.status(200).json({ questions });
            }
        } catch (error) {
            console.error("[QUESTIONS_API] Redis fetch error:", error);
        }

        attempts++;
        if (attempts % 10 === 0) console.log(`[QUESTIONS_API] Still waiting for ${roomId}... (Attempt ${attempts})`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
    }

    console.log(`[QUESTIONS_API] Timed out for room ${roomId} after 60s`);
    return res.status(404).json({ error: 'Room not found or AI generation timed out' });
}
