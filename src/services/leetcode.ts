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
    const response = await fetch('/api/leetcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });

    // If the response is NOT okay (e.g., status 404, 500), handle it as an error.
    if (!response.ok) {
      // Read the body ONCE to get the error details.
      // We check the content-type to decide how to parse it.
      const contentType = response.headers.get('content-type');
      let errorPayload;
      
      if (contentType && contentType.includes('application/json')) {
        // Our API route sends a JSON error object: { error: "..." }
        errorPayload = await response.json();
      } else {
        // If something else goes wrong, we might get an HTML/text error from the server
        errorPayload = await response.text();
      }
      
      // Construct a clear error message and throw it.
      const errorMessage = typeof errorPayload === 'object' && errorPayload.error
        ? errorPayload.error 
        : errorPayload || `API request failed with status ${response.status}`;
        
      throw new Error(errorMessage);
    }

    // If we reach here, the response is OK, and we can safely parse the JSON body once.
    const result = await response.json();
    
    // The actual stats are nested inside the 'data' key returned by our API route
    return result.data;

  } catch (error) {
    console.error("Error in getLeetcodeStats:", error);
    // Re-throw the error so the component's `catch` block can handle it and show an alert.
    throw error;
  }
};