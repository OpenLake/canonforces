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
    const questionsJson = await redis.get(`${BATTLE_ROOM_PREFIX}${battleId}`);
    
    if (!questionsJson) {
      return res.status(404).json({ message: 'Battle not found or has expired.' });
    }

    // Questions are stored as a JSON string
    const questions = JSON.parse(questionsJson as string);
    
    // Optional: Delete the key after fetching so it can't be fetched again
    // await redis.del(`${BATTLE_ROOM_PREFIX}${battleId}`);
    
    res.status(200).json({ questions });
  } catch (error) {
    console.error('Error fetching battle questions:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}