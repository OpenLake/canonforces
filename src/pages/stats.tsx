'use client'; // if using App Router

import React, { useEffect, useState } from 'react';
import styles from '../styles/stats.module.css';
import { getRatingGraph } from '../services/firebase';
import useUser from '../hooks/use-user';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getSolvedCount } from '../services/firebase';
import { doesUsernameExists } from '../services/firebase';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function StatsComparison() {
  const user = useUser();
  const [myRatings, setMyRatings] = useState<number[]>([]);
  const [compareName, setCompareName] = useState('');
  const [otherRatings, setOtherRatings] = useState<number[]>([]);
  const [entered, setEntered] = useState(false);
  const [myAttribute, setMyAttribute] = useState<any>(null);
  const [otherAttribute, setOtherAttribute] = useState<any>(null);

 useEffect(() => {
  if (user.user && user.user.username) {
    const username = user.user.username;
    getRatingGraph(username).then(setMyRatings);
    (async () => {
      const data1 = await getSolvedCount(username);
      const data2 = await doesUsernameExists(username);
      setMyAttribute({ ...data1, ...data2.result[0] });
    })();
  }
}, [user.user]);

  const handleCompare = async () => {
    if (!compareName.trim()) {
      setEntered(false);
      return;
    }

    const ratings = await getRatingGraph(compareName.trim());
    const data3 = await getSolvedCount(compareName.trim());
    const data4 = await doesUsernameExists(compareName.trim());
    setOtherAttribute({ ...data3, ...data4.result[0] });
    setOtherRatings(ratings);
    console.log(data3,data4)
    setEntered(true);
  };

  const LineChart = () => {
    const n = myRatings.length;
    const labels = Array.from({ length: n }, (_, i) => i + 1);

    const myData = myRatings.slice(0, n);
    const otherData = otherRatings.slice(0, n);

    const data = {
      labels,
      datasets: [
        {
          label: 'My Rating',
          data: myData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: false,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        ...(entered && otherData.length > 0
          ? [{
              label: `${compareName}'s Rating`,
              data: otherData,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
              fill: false,
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 5,
            }]
          : [])
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12,
              weight: 500,
            },
          },
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
          },
          ticks: {
            color: '#64748b',
            font: {
              size: 11,
            },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
          },
          ticks: {
            color: '#64748b',
            font: {
              size: 11,
            },
          },
        },
      },
    };

    return (
      <div className={styles.chartContainer}>
        <Line data={data} options={options} />
      </div>
    );
  };

  const StatsTable = () => {
    const formatNumber = (num: number) => {
      if (num === undefined || num === null) return 'N/A';
      return num.toLocaleString();
    };

    const formatPercentage = (accuracy: number) => {
      if (accuracy === undefined || accuracy === null) return 'N/A';
      return `${accuracy.toFixed(1)}%`;
    };

    
    const stats = [
      { label: 'Current Rating', myKey: 'rating', otherKey: 'rating'},
      { label: 'Max Rating', myKey: 'maxRating', otherKey: 'maxRating' },
      { label: 'Current Ranking', myKey: 'rank', otherKey: 'rank'},
      { label: 'Max Ranking', myKey: 'maxRank', otherKey: 'maxRank' },
      { label: 'Problems Solved', myKey: 'solved', otherKey: 'solved'},
      { label: 'Total Submissions', myKey: 'attempt', otherKey: 'attempt'},
      { label: 'Accuracy', myKey: 'accuracy', otherKey: 'accuracy' },
    ];

    return (
      <div className={styles.statsTable}>
        <h3 className={styles.tableTitle}>
          {entered ? 'Stats Comparison' : 'Your Stats'}
        </h3>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Metric</th>
                <th>You</th>
                {entered && <th>{compareName}</th>}
              </tr>
            </thead>
            <tbody>
              {stats.map((stat, index) => {
                const myValue = myAttribute?.[stat.myKey];
                const otherValue = otherAttribute?.[stat.otherKey];
                
                return (
                  <tr key={index}>
                    <td className={styles.metricLabel}>{stat.label}</td>
                    <td className={`${styles.valueCell}`}>
                      {stat.label === 'Accuracy' 
                        ? formatPercentage(myValue) 
                        : formatNumber(myValue)}
                    </td>
                    {entered && (
                      <td className={`${styles.valueCell} `}>
                        {stat.label === 'Accuracy' 
                          ? formatPercentage(otherValue) 
                          : formatNumber(otherValue)}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.statsPageWrapper}>
      <div className={styles.leftContent}>
        <h2 className={styles.pageTitle}>Stats Comparison</h2>

        <div className={styles.floatingInputBar}>
          <input
            className={styles.input}
            type="text"
            placeholder="Enter username to compare…"
            value={compareName}
            onChange={e => setCompareName(e.target.value)}
           onKeyDown={e => e.key === 'Enter' && handleCompare()}
          />
          <button className={styles.compareBtn} onClick={handleCompare}>
            Compare
          </button>
        </div>

        {entered && compareName && (
          <div className={styles.comparisonHeader}>
            <span>
              <span className={styles.comparisonText}>Comparing your ratings with</span>
              <span className={styles.userHighlight}>{compareName}</span>
            </span>
          </div>
        )}

        <div className={styles.chartArea}>
          <LineChart />
        </div>
      </div>

      <div className={styles.rightSidebar}>
        <StatsTable />
      </div>
    </div>
  );
}