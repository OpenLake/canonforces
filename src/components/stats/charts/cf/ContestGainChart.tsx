import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import styles from '../../../../styles/stats.module.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Contest {
  gain: number;
}

interface ChartProps {
  myData: Contest[];
  otherData: Contest[];
  myName?: string;
  otherName?: string;
}

const ContestGainChart: React.FC<ChartProps> = ({ myData, otherData, myName, otherName }) => {
  const isComparing = otherData && otherData.length > 0;
  const maxLength = Math.max(myData.length, otherData.length);
  const labels = Array.from({ length: maxLength }, (_, i) => `Contest ${i + 1}`);

  const data = {
    labels,
    datasets: [
      {
        label: myName || 'You',
        data: myData.map((c) => c.gain),
        backgroundColor: (ctx: any) => {
          if (isComparing) return '#3b82f6';
          const value = ctx.parsed?.y;
          if (typeof value !== 'number') return '#cccccc';
          return value >= 0 ? 'rgba(40, 167, 69, 0.8)' : 'rgba(220, 53, 69, 0.8)';
        },
        borderColor: (ctx: any) => {
          if (isComparing) return '#3b82f6';
          const value = ctx.parsed?.y;
          if (typeof value !== 'number') return '#cccccc';
          return value >= 0 ? '#28a745' : '#dc3545';
        },
        borderWidth: 1,
      },
      ...(isComparing ? [{
        label: otherName,
        data: otherData.map((c) => c.gain),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: '#ef4444',
        borderWidth: 1,
      }] : []),
    ],
  };

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>🏆 Contest Performance</h3>
      </div>
      <div className={styles.chartContainer}>
        <Bar data={data} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </div>
  );
};

export default ContestGainChart;