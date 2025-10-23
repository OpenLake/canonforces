import React from "react";
import NavigationMenu from "../common/components/NavigationMenu/NavigationMenu";
import { UpcomingContests } from "../common/components/UpcomingContests/UpcomingContests";
import styles from "../styles/ContestsList.module.css";
import { BsTrophy, BsBook } from "react-icons/bs";

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
                  Explore upcoming contests and solutions from various platforms
                </p>
              </div>
            </div>
          </div>

          {/* Upcoming Contests */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Upcoming Contests</h2>
            <UpcomingContests />
          </div>

          {/* Contest Solutions */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <BsBook className={styles.icon} /> Contest Solutions
            </h2>
            <p className={styles.sectionSubtitle}>
              Browse editorial solutions and community explanations for past contests.
            </p>
            <div className={styles.solutionsPlaceholder}>
              <p>💡 Contest solutions coming soon...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContestsList;
