'use client';
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getLeetcodeStats, LeetCodeUserStats } from '../../services/leetcode';
import { exportComparisonAsPDF } from '../../lib/utils';
import StatCard from './ui/StatCard';
import SkeletonLoader from './ui/SkeletonLoader';
import ComparisonInsights from './ui/ComparisonInsights';
import LazyLoad from './ui/LazyLoad';
import LCRatingHistoryChart from './charts/lc/LCRatingHistoryChart';
import LCSubmissionStatsChart from './charts/lc/LCSubmissionStatsChart';
import LCTagsChart from './charts/lc/LCTagsChart';
import styles from '../../styles/stats.module.css';

export default function LeetcodeComparison() {
  const [loading, setLoading] = useState(false);
  const [myData, setMyData] = useState<LeetCodeUserStats | null>(null);
  const [otherData, setOtherData] = useState<LeetCodeUserStats | null>(null);

  const [myUsername, setMyUsername] = useState('');
  const [compareName, setCompareName] = useState('');
  const [showResults, setShowResults] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleFetch = async () => {
    if (!myUsername.trim()) {
      alert('Please enter your LeetCode username.');
      return;
    }
    
    setLoading(true);
    setShowResults(true);
    const isComparing = compareName.trim() !== '';

    const myPromise = getLeetcodeStats(myUsername.trim());
    const otherPromise = isComparing ? getLeetcodeStats(compareName.trim()) : Promise.resolve(null);
    
    const [myResult, otherResult] = await Promise.all([myPromise, otherPromise]);

    setMyData(myResult);
    if (isComparing) {
      setOtherData(otherResult);
      if (!otherResult) {
        alert(`Could not find LeetCode user: "${compareName.trim()}"`);
      }
    } else {
        setOtherData(null); // Clear previous comparison data
    }

    if (!myResult) {
        alert(`Could not find LeetCode user: "${myUsername.trim()}"`);
    }

    setLoading(false);
  };

  const handleClear = () => {
    setCompareName('');
    setOtherData(null);
  };
  
  const myTotalSolved = myData?.matchedUser?.submitStats.acSubmissionNum.find(s => s.difficulty === 'All')?.count ?? 0;
  const otherTotalSolved = otherData?.matchedUser?.submitStats.acSubmissionNum.find(s => s.difficulty === 'All')?.count ?? 0;
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className={styles.headerSection}>
        <div className={styles.headerMainContent}>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>LeetCode Analytics</h1>
            <p className={styles.pageSubtitle}>Compare problem-solving stats and contest performance on LeetCode.</p>
          </div>
          <div className={styles.controlsSection}>
            <div className={styles.floatingInputBar}>
              <input
                className={styles.input}
                type="text"
                placeholder="Your LeetCode Username..."
                value={myUsername}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMyUsername(e.target.value)}
              />
              <input
                className={styles.input}
                type="text"
                placeholder="Competitor's Username (optional)..."
                value={compareName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompareName(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleFetch()}
              />
              <div className={styles.buttonGroup}>
                <button className={styles.compareBtn} onClick={handleFetch}>
                  ⚔️ Analyze
                </button>
                {otherData && (
                  <button className={styles.clearBtn} onClick={handleClear}>
                    ✕ Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.headerImage}>
          <Image height={200} width={200} src="/images/compare.png" alt="LeetCode Comparison" />
        </div>
      </div>

      {showResults && (
        <div ref={reportRef}>
          { (myData || loading) && 
            <div className={styles.statCardGrid}>
              <StatCard title="Contest Rating" value={myData?.userContestRanking?.rating} loading={loading} />
              <StatCard title="Total Solved" value={myTotalSolved} loading={loading} />
              <StatCard title="Global Rank" value={myData?.userContestRanking?.globalRanking?.toLocaleString()} loading={loading} />
              <StatCard title="Top Percentage" value={myData?.userContestRanking?.topPercentage ? `${myData.userContestRanking.topPercentage.toFixed(2)}%` : 'N/A'} loading={loading} />
            </div>
          }

          { (otherData || (loading && compareName.trim())) && (
            <div className={styles.statCardGrid}>
              <StatCard title="Contest Rating" value={otherData?.userContestRanking?.rating} loading={loading} />
              <StatCard title="Total Solved" value={otherTotalSolved} loading={loading} />
              <StatCard title="Global Rank" value={otherData?.userContestRanking?.globalRanking?.toLocaleString()} loading={loading} />
              <StatCard title="Top Percentage" value={otherData?.userContestRanking?.topPercentage ? `${otherData.userContestRanking.topPercentage.toFixed(2)}%` : 'N/A'} loading={loading} />
            </div>
          )}

          {!loading && myData && otherData && (
            <ComparisonInsights user1={myData} user2={otherData} platform="lc" />
          )}

          <div className={styles.dashboardGrid}>
            {loading ? (
              <><SkeletonLoader /><SkeletonLoader /><SkeletonLoader /></>
            ) : myData ? (
              <>
                <LazyLoad><LCRatingHistoryChart myData={myData.userContestRankingHistory} otherData={otherData?.userContestRankingHistory} myName={myUsername} otherName={compareName} /></LazyLoad>
                <LazyLoad><LCSubmissionStatsChart myData={myData.matchedUser?.submitStats.acSubmissionNum} otherData={otherData?.matchedUser?.submitStats.acSubmissionNum} myName={myUsername} otherName={compareName} /></LazyLoad>
                <LazyLoad><LCTagsChart myData={myData.matchedUser?.tagProblemCounts} otherData={otherData?.matchedUser?.tagProblemCounts} myName={myUsername} otherName={compareName} /></LazyLoad>
              </>
            ) : null}
          </div>
        </div>
      )}
      
      {showResults && !loading && myData && (
        <div className={styles.exportSection}>
          <button className={styles.exportButton} onClick={() => exportComparisonAsPDF(reportRef)}>
            📄 Export as PDF Report
          </button>
        </div>
      )}
    </motion.div>
  );
}