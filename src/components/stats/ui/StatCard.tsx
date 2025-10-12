import React from 'react';
import styles from '../../../styles/stats.module.css';
import SkeletonLoader from './SkeletonLoader';

interface StatCardProps {
  title: string;
  value?: string | number | null;
  subValue?: string;
  loading: boolean;
  delta?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subValue, loading, delta }) => {
  if (loading) {
    return <div className={styles.statCard}><SkeletonLoader height={80} /></div>;
  }

  const getDeltaClass = () => {
    if (delta === undefined || delta === null) return '';
    return delta > 0 ? styles.deltaPositive : styles.deltaNegative;
  };

  return (
    <div className={styles.statCard}>
      <h3 className={styles.statCardTitle}>{title}</h3>
      <div className={styles.statCardValue}>
        {value ?? 'N/A'}
        {delta !== undefined && delta !== null && (
            <span className={`${styles.delta} ${getDeltaClass()}`}>
                ({delta > 0 ? '+' : ''}{delta})
            </span>
        )}
      </div>
      {subValue && <p className={styles.statCardSubValue}>{subValue}</p>}
    </div>
  );
};

export default StatCard;