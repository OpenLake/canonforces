import { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../../../lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { roomId } = req.query;
    const ROOM_KEY = `quiz:room:${roomId}`;
    const STATE_KEY = `quiz:state:${roomId}`;

    // Long polling: wait for up to 60 seconds for the questions to appear
    let attempts = 0;
    while (attempts < 120) {
        try {
            const data = await redis.get(ROOM_KEY);
            if (data) {
                const questions = typeof data === 'string' ? JSON.parse(data) : data;
                const stateRaw = await redis.get(STATE_KEY);
                const state = stateRaw ? (typeof stateRaw === 'string' ? JSON.parse(stateRaw) : stateRaw) : null;
                return res.status(200).json({ questions, state });
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
