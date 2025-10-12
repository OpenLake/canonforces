'use client';
import React, { useState } from 'react';
import CodeforcesComparison from '../components/stats/CodeforcesComparison';
// CORRECTED CASING ON THE LINE BELOW
import LeetcodeComparison from '../components/stats/LeetCodeComparison'; 
import styles from '../styles/stats.module.css';
import { motion, AnimatePresence } from 'framer-motion';

type Platform = 'codeforces' | 'leetcode';

export default function StatsPage() {
  const [platform, setPlatform] = useState<Platform>('codeforces');

  return (
    <div className={styles.statsPageWrapper}>
      <div className={styles.platformTabs}>
        <button
          className={`${styles.tabButton} ${platform === 'codeforces' ? styles.activeTab : ''}`}
          onClick={() => setPlatform('codeforces')}
        >
          Codeforces
        </button>
        <button
          className={`${styles.tabButton} ${platform === 'leetcode' ? styles.activeTab : ''}`}
          onClick={() => setPlatform('leetcode')}
        >
          LeetCode
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={platform}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {platform === 'codeforces' ? <CodeforcesComparison /> : <LeetcodeComparison />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}