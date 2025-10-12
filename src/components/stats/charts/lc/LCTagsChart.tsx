import React from 'react';
import { Bar } from 'react-chartjs-2';
import styles from '../../../../styles/stats.module.css';

interface Tag {
  tagName: string;
  problemsSolved: number;
}

interface TagProblemCounts {
  advanced: Tag[];
  intermediate: Tag[];
  fundamental: Tag[];
}

interface ChartProps {
  myData?: TagProblemCounts;
  otherData?: TagProblemCounts;
  myName?: string;
  otherName?: string;
}

const LCTagsChart: React.FC<ChartProps> = ({ myData, otherData, myName, otherName }) => {
  const processTags = (tags?: TagProblemCounts) => {
    if (!tags) return [];
    const allTags = [...tags.advanced, ...tags.intermediate, ...tags.fundamental];
    return allTags.sort((a, b) => b.problemsSolved - a.problemsSolved).slice(0, 10);
  };

  const myTopTags = processTags(myData);
  const otherTopTags = processTags(otherData);
  
  const labels = myTopTags.map(t => t.tagName);
  const myTagData = myTopTags.map(t => t.problemsSolved);
  const otherTagData = labels.map(label => {
      const tag = otherTopTags.find(t => t.tagName === label);
      return tag ? tag.problemsSolved : 0;
  });

  const data = {
    labels,
    datasets: [
      {
        label: myName || 'You',
        data: myTagData,
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderWidth: 1,
      },
      ...(otherData ? [{
        label: otherName,
        data: otherTagData,
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderWidth: 1,
      }] : []),
    ],
  };

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>🏷️ Top 10 LeetCode Tags</h3>
      </div>
      <div className={styles.chartContainer}>
        <Bar data={data} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </div>
  );
};

export default LCTagsChart;