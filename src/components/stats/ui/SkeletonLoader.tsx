import React from 'react';
import styles from '../../../styles/stats.module.css';

interface SkeletonLoaderProps {
  height?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ height, className }) => {
  return (
    <div
      className={`${styles.skeleton} ${className || ''}`}
      style={{ height: height ? `${height}px` : '100%' }}
    />
  );
};

export default SkeletonLoader;