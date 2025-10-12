import React from 'react';
import { Line } from 'react-chartjs-2';
import styles from '../../../../styles/stats.module.css';

interface ContestHistory {
    attended: boolean;
    rating: number;
    contest: { title: string };
}

interface ChartProps {
  myData?: ContestHistory[];
  otherData?: ContestHistory[];
  myName?: string;
  otherName?: string;
}

const LCRatingHistoryChart: React.FC<ChartProps> = ({ myData = [], otherData = [], myName, otherName }) => {
  const isComparing = otherData && otherData.length > 0;
  
  const myRatings = myData.filter(c => c.attended).map(c => c.rating);
  const otherRatings = otherData.filter(c => c.attended).map(c => c.rating);
  const n = Math.max(myRatings.length, otherRatings.length);
  const labels = Array.from({ length: n }, (_, i) => `Contest ${i + 1}`);

  const data = {
    labels,
    datasets: [
      {
        label: myName || 'You',
        data: myRatings,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.1)',
        tension: 0.3,
        borderWidth: 3,
      },
      ...(isComparing ? [{
        label: otherName,
        data: otherRatings,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139,92,246,0.1)',
        tension: 0.3,
        borderWidth: 3,
      }] : []),
    ],
  };

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>📈 LeetCode Contest Rating</h3>
      </div>
      <div className={styles.chartContainer}>
        <Line data={data} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </div>
  );
};

export default LCRatingHistoryChart;