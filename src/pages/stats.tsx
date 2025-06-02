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

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function StatsComparison() {
  const user = useUser();
  const [myRatings, setMyRatings] = useState<number[]>([]);
  const [compareName, setCompareName] = useState('');
  const [otherRatings, setOtherRatings] = useState<number[]>([]);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (user.user?.username) {
      getRatingGraph(user.user.username).then(setMyRatings);
    }
  }, [user.user?.username]);

  const handleCompare = async () => {
    if (!compareName.trim()) {
      setEntered(false);
      return;
    }

    const ratings = await getRatingGraph(compareName.trim());
    setOtherRatings(ratings);
    setEntered(true);
  };

  const LineChart = () => {
    const n = myRatings.length;
    const labels = Array.from({ length: n }, (_, i) => i + 1);

    const myData = myRatings.slice(0, n);
    const otherData = otherRatings.slice(0, n); // truncate if too long

    const data = {
      labels,
      datasets: [
        {
          label: 'My Rating',
          data: myData,
          borderColor: 'blue',
          backgroundColor: 'rgba(0, 0, 255, 0.1)',
          tension: 0.4,
          fill: false,
        },
        ...(entered && otherData.length > 0
          ? [{
              label: `${compareName}'s Rating`,
              data: otherData,
              borderColor: 'green',
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              tension: 0.4,
              fill: false,
            }]
          : [])
      ],
    };

    const options = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };

    return <Line data={data} options={options} />;
  };

  return (
    <div className={styles.statsPageWrapper}>
      <h2 className={styles.pageTitle}>Stats Comparison</h2>

      <div className={styles.floatingInputBar}>
        <input
          className={styles.input}
          type="text"
          placeholder="Enter user ID to compare…"
          value={compareName}
          onChange={e => setCompareName(e.target.value)}
        />
        <button className={styles.compareBtn} onClick={handleCompare}>
          Compare
        </button>
      </div>

      <div className={styles.chartArea}>
        <span>
          Comparing your rating{entered && compareName ? ` with ` : ''} 
          {entered && compareName ? (
            <span className={styles.userHighlight}>{compareName}</span>
          ) : null}
        </span>
        <LineChart />
      </div>
    </div>
  );
}
