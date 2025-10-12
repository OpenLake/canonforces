import React from 'react';
import { Bar } from 'react-chartjs-2';
import styles from '../../../../styles/stats.module.css';

interface Submission {
  difficulty: string;
  count: number;
}

interface ChartProps {
  myData?: Submission[];
  otherData?: Submission[];
  myName?: string;
  otherName?: string;
}

const LCSubmissionStatsChart: React.FC<ChartProps> = ({ myData = [], otherData = [], myName, otherName }) => {
  const isComparing = otherData && otherData.length > 0;
  const labels = ['Easy', 'Medium', 'Hard'];

  const getCounts = (data: Submission[]) => {
    const easy = data.find(s => s.difficulty === 'Easy')?.count || 0;
    const medium = data.find(s => s.difficulty === 'Medium')?.count || 0;
    const hard = data.find(s => s.difficulty === 'Hard')?.count || 0;
    return [easy, medium, hard];
  };

  const data = {
    labels,
    datasets: [
      {
        label: myName || 'You',
        data: getCounts(myData),
        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
        borderWidth: 1,
      },
      ...(isComparing ? [{
        label: otherName,
        data: getCounts(otherData),
        backgroundColor: ['rgba(34, 197, 94, 0.5)', 'rgba(245, 158, 11, 0.5)', 'rgba(239, 68, 68, 0.5)'],
        borderWidth: 1,
      }] : []),
    ],
  };

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>📊 Submissions by Difficulty</h3>
      </div>
      <div className={styles.chartContainer}>
        <Bar data={data} options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y' as const }} />
      </div>
    </div>
  );
};

export default LCSubmissionStatsChart;