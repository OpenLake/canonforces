import { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../../../lib/redis';

const BATTLE_ROOM_PREFIX = 'quiz:battle:room:';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { battleId } = req.query;

  if (!battleId || typeof battleId !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid battleId' });
  }

  try {
    // 👇 UPDATED: Renamed 'questionsJson' to 'questions'
    // redis.get() auto-parses the JSON string and returns an object
    const questions = await redis.get(`${BATTLE_ROOM_PREFIX}${battleId}`);
    
    if (!questions) {
      return res.status(404).json({ message: 'Battle not found or has expired.' });
    }

    // 👇 REMOVED: The line `JSON.parse(questionsJson as string)` is gone.
    // 'questions' is already the object we want.
    
    res.status(200).json({ questions });
  } catch (error) {
    console.error('Error fetching battle questions:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}