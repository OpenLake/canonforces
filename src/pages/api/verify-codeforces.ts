import type { NextApiRequest, NextApiResponse } from 'next';

type RequestData = {
    handle: string;
    contestId: string;
    problemIndex: string;
};

type ResponseData = {
    verified: boolean;
    error?: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ verified: false, error: 'Method Not Allowed' });
    }

    const { handle, contestId, problemIndex }: RequestData = req.body;

    if (!handle || !contestId || !problemIndex) {
        return res.status(400).json({ verified: false, error: 'Missing required fields' });
    }

    try {
        const apiUrl = `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=2000`;
        console.log(`[VerifyAPI] Fetching: ${apiUrl}`);

        const response = await fetch(apiUrl);

        if (!response.ok) {
            console.error(`[VerifyAPI] Failed to fetch. Status: ${response.status}`);
            return res.status(response.status).json({ verified: false, error: `Codeforces API returned ${response.status}` });
        }

        const data = await response.json();

        if (data.status !== 'OK') {
            console.error(`[VerifyAPI] API Error: ${data.comment}`);
            return res.status(400).json({ verified: false, error: data.comment || 'Codeforces API returned error status' });
        }

        const targetContestId = parseInt(contestId);

        const matchingSubmission = data.result.find((submission: any) => {
            return (
                submission.contestId === targetContestId &&
                submission.problem.index === problemIndex
            );
        });

        const isSolved = matchingSubmission?.verdict === 'OK';

        if (matchingSubmission) {
            console.log(`[VerifyAPI] Found submission for ${handle}: Verdict=${matchingSubmission.verdict}`);
        } else {
            console.log(`[VerifyAPI] No submission found for ${handle} in ${contestId}${problemIndex} within last 2000 submissions`);
        }

        console.log(`[VerifyAPI] Result for ${handle} on ${contestId}${problemIndex}: ${isSolved}`);
        return res.status(200).json({ verified: isSolved });

    } catch (error: any) {
        console.error('[VerifyAPI] Internal Server Error:', error);
        return res.status(500).json({ verified: false, error: error.message || 'Internal Server Error' });
    }
}
