import type { NextApiRequest, NextApiResponse } from 'next';

export interface Contest {
  platform: string;
  contestName: string;
  contestLink: string;
  startTime: string;
  contestDuration: string;
}

export interface ContestsResponse {
  contests: Contest[];
}

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContestsResponse | ErrorResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://cp-api-arnoob16.vercel.app/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch contests from external API');
    }
    
    const data: ContestsResponse = await response.json();
    
    // Set cache headers - cache for 5 minutes
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching contests:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch contests' 
    });
  }
}
