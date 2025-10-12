// ==========================================================================
// Codeforces Types
// ==========================================================================

export interface CodeforcesUser {
  /** The Codeforces user handle. */
  username: string;
  /** Current rating of the user. */
  rating?: number;
  /** Maximum rating achieved by the user. */
  maxRating?: number;
  /** Current rank title (e.g., "Grandmaster"). */
  rank?: string;
  /** Maximum rank title achieved. */
  maxRank?: string;
}

export interface CodeforcesContest {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
  /** Convenience field: newRating - oldRating. */
  gain: number;
}

export interface CodeforcesStats {
  /** The user's profile information. */
  user: CodeforcesUser;
  /** An array of ratings from past contests for plotting graphs. */
  ratings: number[];
  /** Detailed history of all attended contests. */
  contests: CodeforcesContest[];
  /** A record mapping difficulty rating bands to the number of problems solved. */
  solvedByDifficulty: Record<string, number>; // e.g., { "800-1200": 50, "1200-1600": 30 }
  /** A record mapping problem tags to the number of problems solved. */
  solvedByTag: Record<string, number>; // e.g., { "dp": 25, "greedy": 40 }
}

// ==========================================================================
// LeetCode Types
// ==========================================================================

export interface LeetCodeDifficultyStats {
  /** The difficulty level (e.g., "Easy", "Medium", "Hard", "All"). */
  difficulty: string;
  /** Number of unique problems solved for this difficulty. */
  count: number;
  /** Total number of submissions for this difficulty. */
  submissions: number;
}

export interface LeetCodeTagStats {
  tagName: string;
  problemsSolved: number;
}

export interface LeetCodeContest {
  attended: boolean;
  rating: number;
  ranking: number;
  contest: {
    title: string;
    startTime: number;
  };
}

export interface LeetCodeStats {
  username: string;
  /** Overall user ranking on LeetCode. */
  ranking: number;
  reputation: number;
  /** A breakdown of solved problems by difficulty. Total solved can be derived from the "All" entry. */
  solvedByDifficulty: LeetCodeDifficultyStats[];
  /** A list of problem tags and the count of solved problems for each. */
  solvedByTag: LeetCodeTagStats[];
  /** Detailed history of all attended contests. */
  contestHistory: LeetCodeContest[];
  /** Summary of contest performance. */
  contestSummary: {
    rating: number;
    ranking: number;
    attended: number;
  };
}

// ==========================================================================
// UI & Comparison Types
// ==========================================================================

export interface ComparisonInsight {
  /** The main title of the insight. */
  title: string;
  /** A more detailed description of the comparison point. */
  description: string;
  /** Determines the styling (e.g., color) of the insight card. */
  type: 'positive' | 'negative' | 'neutral';
  /** An emoji or icon name to visually represent the insight. */
  icon: string;
}