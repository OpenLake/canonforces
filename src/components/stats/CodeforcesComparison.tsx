'use client';
import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import useUser from '../../hooks/use-user';
import { motion } from 'framer-motion';
import {
  getRatingGraph,
  getSolvedCount,
  doesUsernameExists,
  getProblemsByTags,
  getProblemsByDifficulty,
  getContestHistory,
} from '../../services/firebase';
import { exportComparisonAsPDF, getAverageGain, getTopTag } from '../../lib/utils';
import RatingTrendChart from './charts/cf/RatingTrendChart';
import ContestGainChart from './charts/cf/ContestGainChart';
import DifficultyChart from './charts/cf/DifficultyChart';
import TagsRadarChart from './charts/cf/TagsRadarChart';
import StatCard from './ui/StatCard';
import SkeletonLoader from './ui/SkeletonLoader';
import ComparisonInsights from './ui/ComparisonInsights';
import LazyLoad from './ui/LazyLoad';
import styles from '../../styles/stats.module.css';

// Define a basic type for user attributes for better type safety
interface UserAttributes {
  handle: string;
  rating: number;
  rank: string;
  maxRating: number;
  maxRank: string;
  solved: number;
}

export default function CodeforcesComparison() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [myData, setMyData] = useState<{
    ratings: number[];
    attributes: UserAttributes | null;
    tags: Record<string, number>;
    difficulty: Record<string, number>;
    contests: any[];
  }>({
    ratings: [],
    attributes: null,
    tags: {},
    difficulty: {},
    contests: [],
  });

  const [otherData, setOtherData] = useState<{
    ratings: number[];
    attributes: UserAttributes | null;
    tags: Record<string, number>;
    difficulty: Record<string, number>;
    contests: any[];
  }>({
    ratings: [],
    attributes: null,
    tags: {},
    difficulty: {},
    contests: [],
  });

  const [compareName, setCompareName] = useState('');
  const [isComparing, setIsComparing] = useState(false);
  
  // CORRECTED THE TYPE HERE from HTMLElement to HTMLDivElement
  const reportRef = useRef<HTMLDivElement>(null);

  // Fetch logged-in user's data
  useEffect(() => {
    if (user && user.username) {
      const username = user.username;
      const fetchData = async () => {
        setLoading(true);
        const [ratings, solvedCount, userData, tags, difficulty, contests] = await Promise.all([
          getRatingGraph(username),
          getSolvedCount(username),
          doesUsernameExists(username),
          getProblemsByTags(username),
          getProblemsByDifficulty(username),
          getContestHistory(username),
        ]);
        setMyData({
          ratings,
          attributes: { ...solvedCount, ...userData.result[0] },
          tags,
          difficulty,
          contests,
        });
        setLoading(false);
      };
      fetchData();
    }
  }, [user]);

  const handleCompare = async () => {
    const usernameToCompare = compareName.trim();
    if (!usernameToCompare) {
      handleClear();
      return;
    }
    setLoading(true);
    const userData = await doesUsernameExists(usernameToCompare);

    if (userData && userData.result.length > 0) {
      const [ratings, solvedCount, tags, difficulty, contests] = await Promise.all([
        getRatingGraph(usernameToCompare),
        getSolvedCount(usernameToCompare),
        getProblemsByTags(usernameToCompare),
        getProblemsByDifficulty(usernameToCompare),
        getContestHistory(usernameToCompare),
      ]);
      setOtherData({
        ratings,
        attributes: { ...solvedCount, ...userData.result[0] },
        tags,
        difficulty,
        contests,
      });
      setIsComparing(true);
    } else {
      alert(`User "${usernameToCompare}" not found!`);
      handleClear();
    }
    setLoading(false);
  };

  const handleClear = () => {
    setCompareName('');
    setIsComparing(false);
    setOtherData({ ratings: [], attributes: null, tags: {}, difficulty: {}, contests: [] });
  };

  const myAvgGain = getAverageGain(myData.contests);
  const myTopTag = getTopTag(myData.tags);
  const otherAvgGain = getAverageGain(otherData.contests);
  const otherTopTag = getTopTag(otherData.tags);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className={styles.headerSection}>
        <div className={styles.headerMainContent}>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>Performance Analytics</h1>
            <p className={styles.pageSubtitle}>Analyze and compare your Codeforces programming journey.</p>
          </div>
          <div className={styles.controlsSection}>
            <div className={styles.floatingInputBar}>
              <input
                className={styles.input}
                type="text"
                placeholder="Enter username to compare..."
                value={compareName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompareName(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleCompare()}
              />
              <div className={styles.buttonGroup}>
                <button className={styles.compareBtn} onClick={handleCompare}>
                  ⚔️ {isComparing ? 'Update' : 'Compare'}
                </button>
                {isComparing && (
                  <button className={styles.clearBtn} onClick={handleClear}>
                    ✕ Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.headerImage}>
          <Image height={200} width={200} src="/images/compare.png" alt="Comparison" />
        </div>
      </div>

      {/* The ref now correctly matches the div element's expected type */}
      <div ref={reportRef}>
        <div className={styles.statCardGrid}>
          <StatCard title="Current Rating" value={myData.attributes?.rating} loading={loading} />
          <StatCard title="Total Solved" value={myData.attributes?.solved} loading={loading} />
          <StatCard title="Avg. Contest Gain" value={myAvgGain} loading={loading} delta={myAvgGain} />
          <StatCard title="Strongest Tag" value={myTopTag.name} subValue={`${myTopTag.count} solved`} loading={loading} />
        </div>

        {isComparing && (
          <div className={styles.statCardGrid}>
            <StatCard title="Current Rating" value={otherData.attributes?.rating} loading={loading} />
            <StatCard title="Total Solved" value={otherData.attributes?.solved} loading={loading} />
            <StatCard title="Avg. Contest Gain" value={otherAvgGain} loading={loading} delta={otherAvgGain} />
            <StatCard title="Strongest Tag" value={otherTopTag.name} subValue={`${otherTopTag.count} solved`} loading={loading} />
          </div>
        )}

        {isComparing && !loading && myData.attributes && otherData.attributes && (
          <ComparisonInsights user1={myData} user2={otherData} platform="cf" />
        )}

        <div className={styles.dashboardGrid}>
          {loading && !myData.attributes ? (
            <><SkeletonLoader /><SkeletonLoader /><SkeletonLoader /><SkeletonLoader /></>
          ) : (
            <>
              <LazyLoad><RatingTrendChart myData={myData.ratings} otherData={otherData.ratings} myName={user?.username} otherName={compareName} /></LazyLoad>
              <LazyLoad><ContestGainChart myData={myData.contests} otherData={otherData.contests} myName={user?.username} otherName={compareName} /></LazyLoad>
              <LazyLoad><DifficultyChart myData={myData.difficulty} otherData={otherData.difficulty} myName={user?.username} otherName={compareName} /></LazyLoad>
              <LazyLoad><TagsRadarChart myData={myData.tags} otherData={otherData.tags} myName={user?.username} otherName={compareName} /></LazyLoad>
            </>
          )}
        </div>
      </div>
      
      {!loading && myData.attributes && (
        <div className={styles.exportSection}>
          <button className={styles.exportButton} onClick={() => exportComparisonAsPDF(reportRef)}>
            📄 Export as PDF Report
          </button>
        </div>
      )}
    </motion.div>
  );
}