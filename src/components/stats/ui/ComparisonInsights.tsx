import React from 'react';
import styles from '../../../styles/stats.module.css';
import { LeetCodeUserStats } from '../../../services/leetcode';

interface InsightsProps {
  user1: any | LeetCodeUserStats;
  user2: any | LeetCodeUserStats;
  platform: 'cf' | 'lc';
}

const ComparisonInsights: React.FC<InsightsProps> = ({ user1, user2, platform }) => {
  let insights: string[] = [];

  if (platform === 'cf') {
    const ratingDiff = user1.attributes.rating - user2.attributes.rating;
    const solvedDiff = user1.attributes.solved - user2.attributes.solved;

    insights.push(ratingDiff > 0 ? `${user1.attributes.handle} has a ${ratingDiff} higher rating.` : `${user2.attributes.handle} has a ${Math.abs(ratingDiff)} higher rating.`);
    insights.push(solvedDiff > 0 ? `${user1.attributes.handle} has solved ${solvedDiff} more problems.` : `${user2.attributes.handle} has solved ${Math.abs(solvedDiff)} more problems.`);
  } else { // LeetCode
    const rating1 = user1.userContestRanking?.rating ?? 0;
    const rating2 = user2.userContestRanking?.rating ?? 0;
    const solved1 = user1.matchedUser?.submitStats.acSubmissionNum.find((s:any) => s.difficulty === 'All')?.count ?? 0;
    const solved2 = user2.matchedUser?.submitStats.acSubmissionNum.find((s:any) => s.difficulty === 'All')?.count ?? 0;
    const ratingDiff = rating1 - rating2;
    const solvedDiff = solved1 - solved2;

    if (ratingDiff !== 0) {
        insights.push(ratingDiff > 0 ? `${user1.matchedUser.username} has a ${ratingDiff.toFixed(0)} higher contest rating.` : `${user2.matchedUser.username} has a ${Math.abs(ratingDiff).toFixed(0)} higher contest rating.`);
    }
    if (solvedDiff !== 0) {
        insights.push(solvedDiff > 0 ? `${user1.matchedUser.username} has solved ${solvedDiff} more problems.` : `${user2.matchedUser.username} has solved ${Math.abs(solvedDiff)} more problems.`);
    }
  }

  if (insights.length === 0) return null;

  return (
    <div className={styles.insightsCard}>
      <h3 className={styles.insightsTitle}>💡 Head-to-Head Insights</h3>
      <ul>
        {insights.map((insight, index) => (
          <li key={index}>{insight}</li>
        ))}
      </ul>
    </div>
  );
};

export default ComparisonInsights;