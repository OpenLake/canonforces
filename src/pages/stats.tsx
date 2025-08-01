'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import styles from '../styles/stats.module.css';
import useUser from '../hooks/use-user';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  getRatingGraph,
  getSolvedCount,
  doesUsernameExists,
  getProblemsByTags,
  getProblemsByDifficulty,
  getContestHistory,
} from '../services/firebase';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  RadialLinearScale
);

export default function StatsComparison() {
  const user = useUser();
  const [myRatings, setMyRatings] = useState<number[]>([]);
  const [compareName, setCompareName] = useState('');
  const [otherRatings, setOtherRatings] = useState<number[]>([]);
  const [entered, setEntered] = useState(false);
  const [myAttribute, setMyAttribute] = useState<any>(null);
  const [otherAttribute, setOtherAttribute] = useState<any>(null);
  const [myTags, setMyTags] = useState<any>({});
  const [otherTags, setOtherTags] = useState<any>({});
  const [myDifficulty, setMyDifficulty] = useState<any>({});
  const [otherDifficulty, setOtherDifficulty] = useState<any>({});
  const [myContests, setMyContests] = useState<any[]>([]);
  const [otherContests, setOtherContests] = useState<any[]>([]);

  useEffect(() => {
    if (user.user && user.user.username) {
      const username = user.user.username;
      getRatingGraph(username).then(setMyRatings);
      (async () => {
        const data1 = await getSolvedCount(username);
        const data2 = await doesUsernameExists(username);
        const tags = await getProblemsByTags(username);
        const difficulty = await getProblemsByDifficulty(username);
        const contests = await getContestHistory(username);

        setMyAttribute({ ...data1, ...data2.result[0] });
        setMyTags(tags);
        setMyDifficulty(difficulty);
        setMyContests(contests);
      })();
    }
  }, [user.user]);

  const handleCompare = async () => {
    if (!compareName.trim()) {
      setEntered(false);
      setOtherRatings([]);
      setOtherAttribute(null);
      setOtherTags({});
      setOtherDifficulty({});
      setOtherContests([]);
      return;
    }

    const ratings = await getRatingGraph(compareName.trim());
    const data3 = await getSolvedCount(compareName.trim());
    const data4 = await doesUsernameExists(compareName.trim());
    const tags2 = await getProblemsByTags(compareName.trim());
    const difficulty2 = await getProblemsByDifficulty(compareName.trim());
    const contests2 = await getContestHistory(compareName.trim());

    setOtherAttribute({ ...data3, ...data4.result[0] });
    setOtherTags(tags2);
    setOtherDifficulty(difficulty2);
    setOtherContests(contests2);
    setOtherRatings(ratings);
    setEntered(true);
  };

  const handleClearComparison = () => {
    setCompareName('');
    setEntered(false);
    setOtherRatings([]);
    setOtherAttribute(null);
    setOtherTags({});
    setOtherDifficulty({});
    setOtherContests([]);
  };

  // ---------- GRAPHS ----------

  const RatingTrendChart = () => {
    const n = Math.max(myRatings.length, otherRatings.length);
    const labels = Array.from({ length: n }, (_, i) => i + 1);

    return (
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>📈 Rating Progress</h3>
          <p className={styles.chartSubtitle}>
            {entered 
              ? "Compare your rating journey with another competitor" 
              : "Track your competitive programming rating over time"
            }
          </p>
        </div>
        <div className={styles.chartContainer}>
          <Line
            data={{
              labels,
              datasets: [
                {
                  label: user.user?.username || 'You',
                  data: myRatings,
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59,130,246,0.1)',
                  tension: 0.4,
                  borderWidth: 3,
                  pointBackgroundColor: '#3b82f6',
                  pointBorderColor: '#ffffff',
                  pointBorderWidth: 2,
                  pointRadius: 4,
                },
                ...(entered
                  ? [
                      {
                        label: compareName,
                        data: otherRatings,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16,185,129,0.1)',
                        tension: 0.4,
                        borderWidth: 3,
                        pointBackgroundColor: '#10b981',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                      },
                    ]
                  : []),
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 12, weight: 500 }
                  }
                },
                tooltip: {
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  titleColor: '#ffffff',
                  bodyColor: '#ffffff',
                  cornerRadius: 8,
                }
              },
              scales: {
                y: {
                  beginAtZero: false,
                  grid: { color: 'rgba(0,0,0,0.1)' },
                  ticks: { font: { size: 11 } }
                },
                x: {
                  grid: { color: 'rgba(0,0,0,0.1)' },
                  ticks: { font: { size: 11 } }
                }
              }
            }}
          />
        </div>
      </div>
    );
  };

 const ContestGainChart = () => {
  const maxLength = Math.max(myContests.length, otherContests.length);
  const labels = Array.from({ length: maxLength }, (_, i) => `Contest ${i + 1}`);
  const myData = myContests.map((c: any) => c.gain);
  const otherData = entered ? otherContests.map((c: any) => c.gain) : [];

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>🏆 Contest Performance</h3>
        <p className={styles.chartSubtitle}>
          {entered 
            ? "Rating gain/loss comparison across recent contests" 
            : "Your rating changes in recent contests"
          }
        </p>
      </div>
      <div className={styles.chartContainer}>
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: user.user?.username || 'You',
                data: myData,
                backgroundColor: entered ? '#007bff' : ((ctx: any) => {
                  const value = ctx.parsed?.y;
                  if (typeof value !== "number") return '#007bff';
                  return value >= 0 ? '#28a745' : '#dc3545';
                }),
                borderColor: entered ? '#0056b3' : ((ctx: any) => {
                  const value = ctx.parsed?.y;
                  if (typeof value !== "number") return '#0056b3';
                  return value >= 0 ? '#1e7e34' : '#c82333';
                }),
                borderWidth: 2,
                borderRadius: 6,
              },
              ...(entered
                ? [
                    {
                      label: compareName,
                      data: otherData,
                      backgroundColor: '#6f42c1',
                      borderColor: '#5a2d91',
                      borderWidth: 2,
                      borderRadius: 6,
                    },
                  ]
                : []),
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  usePointStyle: true,
                  padding: 20,
                  font: { size: 12, weight: 600 },
                  color: '#000000'
                }
              },
              tooltip: {
                backgroundColor: 'rgba(0,0,0,0.9)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                cornerRadius: 8,
                titleFont: { weight: 600 },
                bodyFont: { weight: 500 }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { 
                  color: 'rgba(0,0,0,0.1)',
                  lineWidth: 1
                },
                ticks: { 
                  font: { size: 11, weight: 500 },
                  color: '#666666'
                }
              },
              x: {
                grid: { display: false },
                ticks: { 
                  font: { size: 11, weight: 500 },
                  color: '#666666'
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
};
  const DifficultyChart = () => {
    const myValues = Object.values(myDifficulty);
    const otherValues = entered ? Object.values(otherDifficulty) : [];
    const labels = Object.keys(myDifficulty);

    const colors = [
      '#22c55e', // Easy - Green
      '#3b82f6', // Medium - Blue  
      '#f59e0b', // Hard - Orange
      '#ef4444', // Expert - Red
      '#8b5cf6', // Master - Purple
    ];

    return (
      <div className={`${styles.chartCard} ${entered ? styles.splitChart : ''}`}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>🎯 Problems by Difficulty</h3>
          <p className={styles.chartSubtitle}>
            {entered 
              ? "Distribution of solved problems by difficulty level" 
              : "Your problem-solving distribution across difficulty levels"
            }
          </p>
        </div>
        <div className={styles.difficultyChartContainer}>
          <div className={styles.doughnutWrapper}>
            <h4 className={styles.chartLabel}>{user.user?.username || 'You'}</h4>
            <Doughnut
              data={{
                labels,
                datasets: [
                  {
                    data: myValues,
                    backgroundColor: colors,
                    borderColor: '#ffffff',
                    borderWidth: 3,
                    hoverBorderWidth: 4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: entered ? 'bottom' : 'right',
                    labels: {
                      usePointStyle: true,
                      padding: 15,
                      font: { size: 11, weight: 500 }
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    cornerRadius: 8,
                  }
                },
                cutout: '60%',
              }}
            />
          </div>
          {entered && (
            <div className={styles.doughnutWrapper}>
              <h4 className={styles.chartLabel}>{compareName}</h4>
              <Doughnut
                data={{
                  labels,
                  datasets: [
                    {
                      data: otherValues,
                      backgroundColor: colors,
                      borderColor: '#ffffff',
                      borderWidth: 3,
                      hoverBorderWidth: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 11, weight: 500 }
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      titleColor: '#ffffff',
                      bodyColor: '#ffffff',
                      cornerRadius: 8,
                    }
                  },
                  cutout: '60%',
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const TagsRadarChart = () => {
    const labels = Object.keys(myTags).slice(0, 8); // top 8 tags
    const myData = labels.map((tag) => myTags[tag] || 0);
    const otherData = entered ? labels.map((tag) => otherTags[tag] || 0) : [];

    return (
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>🏷️ Top Problem Tags</h3>
          <p className={styles.chartSubtitle}>
            {entered 
              ? "Compare your strengths across different problem categories" 
              : "Your problem-solving expertise across different topics"
            }
          </p>
        </div>
        <div className={styles.chartContainer}>
          <Radar
            data={{
              labels,
              datasets: [
                {
                  label: user.user?.username || 'You',
                  data: myData,
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59,130,246,0.15)',
                  borderWidth: 3,
                  pointBackgroundColor: '#3b82f6',
                  pointBorderColor: '#ffffff',
                  pointBorderWidth: 2,
                  pointRadius: 5,
                },
                ...(entered
                  ? [
                      {
                        label: compareName,
                        data: otherData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16,185,129,0.15)',
                        borderWidth: 3,
                        pointBackgroundColor: '#10b981',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                      },
                    ]
                  : []),
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 12, weight: 500 }
                  }
                },
                tooltip: {
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  titleColor: '#ffffff',
                  bodyColor: '#ffffff',
                  cornerRadius: 8,
                }
              },
              scales: {
                r: {
                  beginAtZero: true,
                  grid: { color: 'rgba(0,0,0,0.1)' },
                  angleLines: { color: 'rgba(0,0,0,0.1)' },
                  pointLabels: { font: { size: 11 } },
                  ticks: { font: { size: 10 } }
                }
              }
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={styles.statsPageWrapper}>
      <div className={styles.leftContent}>
        {/* PASTE THIS NEW CODE IN ITS PLACE */}
<div className={styles.headerSection}>
  <div className={styles.headerContent}>
    
    {/* ===== LEFT COLUMN: Text + Search Bar ===== */}
    <div className={styles.headerMainContent}>
      <div className={styles.headerText}>
        <h1 className={styles.pageTitle}>Performance Analytics</h1>
        <p className={styles.pageSubtitle}>
          Analyze and compare your competitive programming journey
        </p>
      </div>
      
      {/* ===== MOVED CONTROLS SECTION ===== */}
      <div className={styles.controlsSection}>
        <div className={styles.searchContainer}>
          <div className={styles.floatingInputBar}>
            <div className={styles.inputWrapper}>
              <div className={styles.searchIcon}>🔍</div>
              <input
                className={styles.input}
                type="text"
                placeholder="Enter username to compare with..."
                value={compareName}
                onChange={(e) => setCompareName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
              />
            </div>
            <div className={styles.buttonGroup}>
              <button className={styles.compareBtn} onClick={handleCompare}>
                <span className={styles.btnIcon}>⚔️</span>
                {entered ? 'Update' : 'Compare'}
              </button>
              {entered && (
                <button className={styles.clearBtn} onClick={handleClearComparison}>
                  <span className={styles.btnIcon}>✕</span>
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {entered && compareName && (
          <div className={styles.comparisonStatus}>
            <div className={styles.comparisonBadge}>
              <div className={styles.battleIcon}>⚔️</div>
              <div className={styles.comparisonDetails}>
                <div className={styles.comparisonTitle}>Battle Mode Active</div>
                <div className={styles.comparisonText}>
                  <span className={styles.username}>{user.user?.username || 'You'}</span>
                  <span className={styles.vs}>VS</span>
                  <span className={styles.username}>{compareName}</span>
                </div>
              </div>
              <div className={styles.statusIndicator}></div>
            </div>
          </div>
        )}
      </div>
    </div>
    
    {/* ===== RIGHT COLUMN: Image ===== */}
    <div className={styles.headerImage}>
      <Image 
        height={250}
        width={250}
        src="/images/compare.png" 
        alt="Comparison Analytics" 
        className={styles.compareSticker}
      />
    </div>
  </div>
</div>
        <div className={styles.dashboardGrid}>
          <RatingTrendChart />
          <ContestGainChart />
          <DifficultyChart />
          <TagsRadarChart />
        </div>
      </div>
    </div>
  );
}