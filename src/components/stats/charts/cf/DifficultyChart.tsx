import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import styles from '../../../../styles/stats.module.css';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ChartProps {
  myData: Record<string, number>;
  otherData: Record<string, number>;
  myName?: string;
  otherName?: string;
}

const DifficultyChart: React.FC<ChartProps> = ({ myData, otherData, myName, otherName }) => {
  const isComparing = otherData && Object.keys(otherData).length > 0;
  const labels = Object.keys(myData);
  const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: isComparing ? 'bottom' as const : 'right' as const } },
    cutout: '60%',
  };

  const myChartData = {
    labels,
    datasets: [{ data: Object.values(myData), backgroundColor: colors, borderWidth: 2 }],
  };

  const otherChartData = {
    labels: Object.keys(otherData),
    datasets: [{ data: Object.values(otherData), backgroundColor: colors, borderWidth: 2 }],
  };

  return (
    <div className={`${styles.chartCard} ${isComparing ? styles.splitChart : ''}`}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>🎯 Problems by Difficulty</h3>
      </div>
      <div className={styles.difficultyChartContainer}>
        <div className={styles.doughnutWrapper}>
          <h4 className={styles.chartLabel}>{myName || 'You'}</h4>
          <Doughnut data={myChartData} options={chartOptions} />
        </div>
        {isComparing && (
          <div className={styles.doughnutWrapper}>
            <h4 className={styles.chartLabel}>{otherName}</h4>
            <Doughnut data={otherChartData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DifficultyChart;