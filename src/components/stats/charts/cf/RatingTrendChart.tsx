import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';
import styles from '../../../../styles/stats.module.css';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

interface ChartProps {
  myData: number[];
  otherData: number[];
  myName?: string;
  otherName?: string;
}

const RatingTrendChart: React.FC<ChartProps> = ({ myData, otherData, myName, otherName }) => {
  const isComparing = otherData && otherData.length > 0;
  const n = Math.max(myData.length, otherData.length);
  const labels = Array.from({ length: n }, (_, i) => i + 1);

  const data = {
    labels,
    datasets: [
      {
        label: myName || 'You',
        data: myData,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.1)',
        tension: 0.4,
        borderWidth: 3,
      },
      ...(isComparing ? [{
        label: otherName,
        data: otherData,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        tension: 0.4,
        borderWidth: 3,
      }] : []),
    ],
  };

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>📈 Rating Progress</h3>
      </div>
      <div className={styles.chartContainer}>
        <Line data={data} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </div>
  );
};

export default RatingTrendChart;