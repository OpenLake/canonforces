import React from 'react';
import NavigationMenu from '../common/components/NavigationMenu/NavigationMenu';
import { UpcomingContests } from '../common/components/UpcomingContests/UpcomingContests';
import styles from '../styles/ContestsList.module.css';
import { BsTrophy, BsCalendar3, BsAward } from 'react-icons/bs';

const ContestsList = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavigationMenu />
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Header Section */}
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.headerIcon}>
                <BsTrophy size="2.5rem" />
              </div>
              <div className={styles.headerText}>
                <h1 className={styles.title}>Programming Contests</h1>
                <p className={styles.subtitle}>
                  Stay updated with upcoming programming contests from various platforms
                </p>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <BsCalendar3 className={styles.featureIcon} />
              <h3>Real-time Updates</h3>
              <p>Get the latest contest schedules from multiple platforms</p>
            </div>
            <div className={styles.featureCard}>
              <BsTrophy className={styles.featureIcon} />
              <h3>Multiple Platforms</h3>
              <p>Contests from Codeforces, AtCoder, CodeChef, and more</p>
            </div>
            <div className={styles.featureCard}>
              <BsAward className={styles.featureIcon} />
              <h3>Never Miss Out</h3>
              <p>Direct links to contest pages for easy participation</p>
            </div>
          </div>

          {/* Contests Section */}
          <div className={styles.contestsSection}>
            <UpcomingContests />
          </div>

          {/* Future Features Section */}
          <div className={styles.futureSection}>
            <h2 className={styles.futureTitle}>🚀 Coming Soon</h2>
            <div className={styles.futureGrid}>
              <div className={styles.futureCard}>
                <h3>Contest Solutions</h3>
                <p>Browse editorial solutions and explanations for past contests</p>
              </div>
              <div className={styles.futureCard}>
                <h3>Contest Reminders</h3>
                <p>Get notified before your favorite contests start</p>
              </div>
              <div className={styles.futureCard}>
                <h3>Performance Analytics</h3>
                <p>Track your contest performance across different platforms</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContestsList;
