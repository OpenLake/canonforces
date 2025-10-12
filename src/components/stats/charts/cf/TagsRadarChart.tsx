import React from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import styles from '../../../../styles/stats.module.css';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Tooltip, Legend);

interface ChartProps {
  myData: Record<string, number>;
  otherData: Record<string, number>;
  myName?: string;
  otherName?: string;
}

const TagsRadarChart: React.FC<ChartProps> = ({ myData, otherData, myName, otherName }) => {
  const isComparing = otherData && Object.keys(otherData).length > 0;
  const labels = Object.keys(myData).slice(0, 8); // Top 8 tags

  const data = {
    labels,
    datasets: [
      {
        label: myName || 'You',
        data: labels.map((tag) => myData[tag] || 0),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 2,
      },
      ...(isComparing ? [{
        label: otherName,
        data: labels.map((tag) => otherData[tag] || 0),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderWidth: 2,
      }] : []),
    ],
  };

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>🏷️ Top Problem Tags</h3>
      </div>
      <div className={styles.chartContainer}>
        <Radar data={data} options={{ responsive: true, maintainAspectRatio: false, scales: { r: { beginAtZero: true } } }} />
      </div>
    </div>
  );
};

export default TagsRadarChart;