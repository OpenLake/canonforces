import { NextResponse } from 'next/server';

// This is the single, comprehensive GraphQL query to get all the data we need.
const LEETCODE_API_QUERY = `
  query getUserProfile($username: String!) {
    allQuestionsCount {
      difficulty
      count
    }
    matchedUser(username: $username) {
      username
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      tagProblemCounts: tagProblemCounts {
        advanced {
          tagName
          problemsSolved
        }
        intermediate {
          tagName
          problemsSolved
        }
        fundamental {
          tagName
          problemsSolved
        }
      }
    }
    userContestRanking(username: $username) {
        attendedContestsCount
        rating
        globalRanking
        topPercentage
    }
    userContestRankingHistory(username: $username) {
        attended
        rating
        ranking
        contest {
            title
            startTime
        }
    }
  }
`;

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com', // LeetCode API requires a Referer header
      },
      body: JSON.stringify({
        query: LEETCODE_API_QUERY,
        variables: { username },
      }),
    });

    const data = await res.json();

    if (data.errors) {
        // Specifically check for "user not found" type errors
        if (data.errors[0].message.includes("That user does not exist")) {
             return NextResponse.json({ error: `User '${username}' not found on LeetCode.` }, { status: 404 });
        }
        throw new Error(data.errors[0].message || 'An error occurred with the LeetCode API.');
    }
    
    // Also handle cases where the user exists but has no data
    if (!data.data.matchedUser) {
        return NextResponse.json({ error: `User '${username}' not found on LeetCode.` }, { status: 404 });
    }

    return NextResponse.json(data);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}