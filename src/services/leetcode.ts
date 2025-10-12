export interface LeetCodeUserStats {
  allQuestionsCount: { difficulty: string; count: number }[];
  matchedUser?: {
    username: string;
    submitStats: {
      acSubmissionNum: {
        difficulty: string;
        count: number;
        submissions: number;
      }[];
    };
    tagProblemCounts: {
      advanced: { tagName: string; problemsSolved: number }[];
      intermediate: { tagName:string; problemsSolved: number }[];
      fundamental: { tagName: string; problemsSolved: number }[];
    };
  };
  userContestRanking?: {
    attendedContestsCount: number;
    rating: number;
    globalRanking: number;
    topPercentage: number;
  };
  userContestRankingHistory?: {
    attended: boolean;
    rating: number;
    contest: { title: string };
  }[];
}

export const getLeetcodeStats = async (username: string): Promise<LeetCodeUserStats | null> => {
  try {
    const response = await fetch('/api/leetcode', { // Assuming your API route is at /api/leetcode
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
        // LeetCode API might return errors in a valid response, check data first
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch LeetCode data');
    }

    const { data } = await response.json();

    if (!data.matchedUser) {
        throw new Error(`User '${username}' not found on LeetCode.`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching LeetCode stats:', error);
    // Return null or throw to be handled by the calling component
    return null;
  }
};