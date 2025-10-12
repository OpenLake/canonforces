export interface CodeforcesUser {
  username: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
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
  gain: number;
}

export interface CodeforcesProblem {
  rating?: number;
  tags: string[];
}

export interface CodeforcesStats {
  ratings: number[];
  contests: CodeforcesContest[];
  solvedCount: {
    easy: number;
    medium: number;
    hard: number;
    expert: number;
    master: number;
  };
  tags: Record<string, number>;
  difficulty: Record<string, number>;
  userInfo: CodeforcesUser;
}

export interface LeetCodeSubmission {
  difficulty: string;
  count: number;
  submissions: number;
}

export interface LeetCodeTag {
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
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number;
  ranking: number;
  contributionPoints: number;
  reputation: number;
  submissionStats: LeetCodeSubmission[];
  tags: LeetCodeTag[];
  contests: LeetCodeContest[];
  contestRating: number;
  contestRanking: number;
  attendedContests: number;
}

export interface ComparisonInsight {
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  icon: string;
}
