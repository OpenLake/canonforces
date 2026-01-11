import React, { useState, useEffect } from "react";
import NavigationMenu from "../common/components/NavigationMenu/NavigationMenu";
import styles from "../styles/ContestsList.module.css";
import { BsTrophy, BsBook, BsCalendarEvent, BsClock, BsLink45Deg } from "react-icons/bs";
import { SiCodeforces, SiLeetcode, SiCodechef } from "react-icons/si";

// Interface matches the new API response
interface Contest {
  platform: string;
  contestName: string;
  contestLink: string;
  startTime: number;
  duration: number;
}

const ContestsList = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await fetch("/api/contests");
        const data = await res.json();
        setContests(data.contests || []);
      } catch (error) {
        console.error("Failed to fetch contests", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  // Helper to format duration
  const formatDuration = (ms: number): string => {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`;
  };

  // Helper to format Date
  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Helper for Platform Icons
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "codeforces": return <SiCodeforces className="text-red-500" />;
      case "leetcode": return <SiLeetcode className="text-orange-500" />;
      case "codechef": return <SiCodechef className="text-amber-800" />;
      default: return <BsTrophy className="text-blue-500" />;
    }
  };

  const filteredContests = filter === "all" 
    ? contests 
    : contests.filter(c => c.platform.toLowerCase() === filter);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <NavigationMenu />
      <main className={styles.main}>
        <div className={styles.container}>
          
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.headerIconWrapper}>
                <BsTrophy size="2rem" color="white" />
              </div>
              <div className={styles.headerText}>
                <h1 className={styles.title}>CanonForces Contests</h1>
                <p className={styles.subtitle}>Track upcoming competitive programming events.</p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className={styles.tabsContainer}>
            {["all", "codeforces", "leetcode", "codechef"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`${styles.tab} ${filter === f ? styles.activeTab : ""}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Contests Grid */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {loading ? "Loading Schedule..." : `Upcoming Events (${filteredContests.length})`}
            </h2>
            
            <div className={styles.grid}>
              {loading ? (
                // Skeleton Loader
                [1, 2, 3].map((n) => <div key={n} className={styles.skeletonCard}></div>)
              ) : filteredContests.length > 0 ? (
                filteredContests.map((contest, idx) => (
                  <div key={idx} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <span className={styles.platformIcon}>
                        {getPlatformIcon(contest.platform)}
                      </span>
                      <span className={`${styles.badge} ${styles[contest.platform.toLowerCase()]}`}>
                        {contest.platform}
                      </span>
                    </div>
                    
                    <h3 className={styles.cardTitle} title={contest.contestName}>
                      {contest.contestName}
                    </h3>

                    <div className={styles.metaInfo}>
                      <div className={styles.metaItem}>
                        <BsCalendarEvent />
                        <span>{formatDate(contest.startTime)}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <BsClock />
                        <span>{formatDuration(contest.duration)}</span>
                      </div>
                    </div>

                    <a 
                      href={contest.contestLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.cardButton}
                    >
                      Register Now <BsLink45Deg />
                    </a>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>No contests found for this platform.</div>
              )}
            </div>
          </div>

          {/* Solutions Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <BsBook className="text-indigo-500" /> Editorials
            </h2>
            <div className={styles.solutionsPlaceholder}>
              <p>💡 Solutions and editorials will appear here after contests conclude.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContestsList;