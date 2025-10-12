import { CodeforcesStats, CodeforcesContest } from "../types/stats";

const CF_API_BASE = 'https://codeforces.com/api';

export async function getRatingGraph(username: string): Promise<number[]> {
  try {
    const response = await fetch(`${CF_API_BASE}/user.rating?handle=${username}`);
    const data = await response.json();
    
    if (data.status === 'OK') {
      return data.result.map((contest: any) => contest.newRating);
    }
    return [];
  } catch (error) {
    console.error('Error fetching rating graph:', error);
    return [];
  }
}

export async function getContestHistory(username: string): Promise<CodeforcesContest[]> {
  try {
    const response = await fetch(`${CF_API_BASE}/user.rating?handle=${username}`);
    const data = await response.json();
    
    if (data.status === 'OK') {
      return data.result.map((contest: any) => ({
        contestId: contest.contestId,
        contestName: contest.contestName,
        handle: contest.handle,
        rank: contest.rank,
        ratingUpdateTimeSeconds: contest.ratingUpdateTimeSeconds,
        oldRating: contest.oldRating,
        newRating: contest.newRating,
        gain: contest.newRating - contest.oldRating,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching contest history:', error);
    return [];
  }
}

export async function getSolvedCount(username: string) {
  try {
    const response = await fetch(`${CF_API_BASE}/user.status?handle=${username}`);
    const data = await response.json();
    
    if (data.status === 'OK') {
      const solved = new Set<string>();
      data.result.forEach((submission: any) => {
        if (submission.verdict === 'OK' && submission.problem.rating) {
          solved.add(`${submission.problem.contestId}-${submission.problem.index}`);
        }
      });
      return { solved: solved.size };
    }
    return { solved: 0 };
  } catch (error) {
    console.error('Error fetching solved count:', error);
    return { solved: 0 };
  }
}

export async function doesUsernameExists(username: string) {
  try {
    const response = await fetch(`${CF_API_BASE}/user.info?handles=${username}`);
    const data = await response.json();
    
    if (data.status === 'OK' && data.result.length > 0) {
      const user = data.result[0];
      return {
        result: [{
          rating: user.rating || 0,
          maxRating: user.maxRating || 0,
          rank: user.rank || 'Unrated',
          maxRank: user.maxRank || 'Unrated',
        }]
      };
    }
    return { result: [{}] };
  } catch (error) {
    console.error('Error checking username:', error);
    return { result: [{}] };
  }
}

export async function getProblemsByTags(username: string): Promise<Record<string, number>> {
  try {
    const response = await fetch(`${CF_API_BASE}/user.status?handle=${username}`);
    const data = await response.json();
    
    if (data.status === 'OK') {
      const tagCount: Record<string, number> = {};
      const solved = new Set<string>();
      
      data.result.forEach((submission: any) => {
        if (submission.verdict === 'OK') {
          const problemKey = `${submission.problem.contestId}-${submission.problem.index}`;
          if (!solved.has(problemKey)) {
            solved.add(problemKey);
            submission.problem.tags.forEach((tag: string) => {
              tagCount[tag] = (tagCount[tag] || 0) + 1;
            });
          }
        }
      });
      
      return tagCount;
    }
    return {};
  } catch (error) {
    console.error('Error fetching problems by tags:', error);
    return {};
  }
}

export async function getProblemsByDifficulty(username: string): Promise<Record<string, number>> {
  try {
    const response = await fetch(`${CF_API_BASE}/user.status?handle=${username}`);
    const data = await response.json();
    
    if (data.status === 'OK') {
      const difficulty: Record<string, number> = {
        '<800': 0,
        '800-1200': 0,
        '1200-1600': 0,
        '1600-2000': 0,
        '2000+': 0,
      };
      
      const solved = new Set<string>();
      
      data.result.forEach((submission: any) => {
        if (submission.verdict === 'OK' && submission.problem.rating) {
          const problemKey = `${submission.problem.contestId}-${submission.problem.index}`;
          if (!solved.has(problemKey)) {
            solved.add(problemKey);
            const rating = submission.problem.rating;
            
            if (rating < 800) difficulty['<800']++;
            else if (rating < 1200) difficulty['800-1200']++;
            else if (rating < 1600) difficulty['1200-1600']++;
            else if (rating < 2000) difficulty['1600-2000']++;
            else difficulty['2000+']++;
          }
        }
      });
      
      return difficulty;
    }
    return {};
  } catch (error) {
    console.error('Error fetching problems by difficulty:', error);
    return {};
  }
}

export async function fetchCodeforcesStats(username: string): Promise<CodeforcesStats | null> {
  try {
    const [ratings, contests, solvedData, userInfo, tags, difficulty] = await Promise.all([
      getRatingGraph(username),
      getContestHistory(username),
      getSolvedCount(username),
      doesUsernameExists(username),
      getProblemsByTags(username),
      getProblemsByDifficulty(username),
    ]);

    const userInfoData = userInfo.result && userInfo.result[0];
    
    return {
      ratings,
      contests,
      solvedCount: {
        easy: difficulty['<800'] || 0,
        medium: difficulty['800-1200'] || 0,
        hard: difficulty['1200-1600'] || 0,
        expert: difficulty['1600-2000'] || 0,
        master: difficulty['2000+'] || 0,
      },
      tags,
      difficulty,
      userInfo: {
        username,
        rating: (userInfoData && 'rating' in userInfoData) ? userInfoData.rating : 0,
        maxRating: (userInfoData && 'maxRating' in userInfoData) ? userInfoData.maxRating : 0,
        rank: (userInfoData && 'rank' in userInfoData) ? userInfoData.rank : 'Unrated',
        maxRank: (userInfoData && 'maxRank' in userInfoData) ? userInfoData.maxRank : 'Unrated',
      },
    };
  } catch (error) {
    console.error('Error fetching Codeforces stats:', error);
    return null;
  }
}
