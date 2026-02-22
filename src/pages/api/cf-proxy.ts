import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid URL parameter' });
    }

    // Security check: Only allow codeforces.com URLs
    if (!url.startsWith('https://codeforces.com/api/')) {
        return res.status(400).json({ error: 'Only Codeforces API URLs are allowed' });
    }

    try {
        const cfResponse = await fetch(url);
        const data = await cfResponse.json();

        // Pass through the status code and data
        return res.status(cfResponse.status).json(data);
    } catch (error: any) {
        console.error('[CF-Proxy] Error:', error);
        return res.status(500).json({ error: 'Failed to fetch from Codeforces', message: error.message });
    }
}
