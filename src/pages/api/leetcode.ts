import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server'; // We can keep this for simpler JSON responses

const LEETCODE_API_QUERY = `
  query getUserProfile($username: String!) {
    allQuestionsCount { difficulty count }
    matchedUser(username: $username) {
      username
      submitStats: submitStatsGlobal {
        acSubmissionNum { difficulty count submissions }
      }
      tagProblemCounts: tagProblemCounts {
        advanced { tagName problemsSolved }
        intermediate { tagName problemsSolved }
        fundamental { tagName problemsSolved }
      }
    }
    userContestRanking(username: $username) {
        attendedContestsCount rating globalRanking topPercentage
    }
    userContestRankingHistory(username: $username) {
        attended rating ranking contest { title startTime }
    }
  }
`;

// The main export must be a default function for Pages Router API routes
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // We only want to handle POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const leetcodeResponse = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      body: JSON.stringify({
        query: LEETCODE_API_QUERY,
        variables: { username },
      }),
    });

    if (!leetcodeResponse.ok) {
      throw new Error(`LeetCode API responded with status: ${leetcodeResponse.status}`);
    }

    const data = await leetcodeResponse.json();

    if (data.errors) {
      if (data.errors[0].message.includes("That user does not exist")) {
        return res.status(404).json({ error: `User '${username}' not found on LeetCode.` });
      }
      throw new Error(data.errors[0].message || 'An error occurred with the LeetCode API.');
    }
    
    if (!data.data.matchedUser) {
      return res.status(404).json({ error: `User '${username}' not found on LeetCode.` });
    }

    // On success, return a 200 OK status with the data
    return res.status(200).json(data);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred';
    return res.status(500).json({ error: errorMessage });
  }
}