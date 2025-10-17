// 📁 /components/quiz/ProgressBar.tsx

import React from 'react';
import styles from '../../styles/Quiz.module.css';

interface Props {
  current: number;
  total: number;
}

const ProgressBar: React.FC<Props> = ({ current, total }) => {
  const progressPercentage = (current / total) * 100;
  return (
    <div className={styles['progress-bar-container']}>
      <div 
        className={styles['progress-bar']} 
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;