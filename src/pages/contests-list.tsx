import React, { useState, useEffect } from "react";
import Image from "next/image";
import NavigationMenu from "../common/components/NavigationMenu/NavigationMenu";
import PastContestsList from "../components/contests/PastContestsList";
import styles from "../styles/ContestsList.module.css";
import { BsTrophy, BsBook, BsCalendarEvent, BsClock, BsLink45Deg, BsExclamationTriangle, BsClockHistory } from "react-icons/bs";

interface Contest {
  platform: string;
  contestName: string;
  contestLink: string;
  startTime: number;
  duration: number;
}

interface ApiResponse {
  contests: Contest[];
  source?: "clist" | "fallback";
}

const ContestsList = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [isFallback, setIsFallback] = useState(false); // Track if we are using backup data
  const [view, setView] = useState<"upcoming" | "past">("upcoming"); // New: toggle between upcoming and past

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await fetch("/api/contests");
        const data = await res.json();
        console.log("Contest source:", data.source);
        setContests(data.contests || []);
        setIsFallback(data.source === "fallback");
      } catch (error) {
        console.error("Failed to fetch contests", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  const formatDuration = (ms: number): string => {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`;
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getPlatformLogo = (platform: string) => {
    const p = platform.toLowerCase();
    const validLogos = ["codeforces", "leetcode", "codechef", "atcoder", "hackerearth"];

    if (validLogos.includes(p)) {
      return (
        <Image
          src={`/logos/${p}.png`}
          alt={`${platform} logo`}
          width={32}
          height={32}
          className={styles.logoImage}
        />
      );
    }
    return <BsTrophy className="text-blue-500" size={24} />;
  };

  // Filter Logic
  const filteredContests = filter === "all"
    ? contests
    : contests.filter(c => c.platform.toLowerCase() === filter);

  // Define tabs based on available data or defaults
  const tabs = ["all", "codeforces", "leetcode", "codechef", "atcoder", "hackerearth"];

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
                <p className={styles.subtitle}>
                  {view === "upcoming"
                    ? "Track upcoming competitive programming events."
                    : "Review previous contests and explore solutions."}
                </p>
              </div>
            </div>
          </div>

          {/* Warning if using Fallback Data */}
          {isFallback && !loading && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3 text-yellow-800">
              <BsExclamationTriangle />
              <span>
                Note: Primary contest service is currently unavailable. Showing limited data (Codeforces, LeetCode, CodeChef only).
              </span>
            </div>
          )}

          {/* View Toggle */}
          <div className="mb-6 flex items-center justify-center gap-2 bg-gray-100 p-1 rounded-lg w-fit mx-auto">
            <button
              onClick={() => setView("upcoming")}
              className={`
                px-6 py-2 rounded-md font-medium transition-all duration-200
                ${view === "upcoming"
                  ? "bg-white text-indigo-600 shadow"
                  : "text-gray-600 hover:text-gray-900"}
              `}
            >
              <BsCalendarEvent className="inline mr-2" />
              Upcoming Contests
            </button>
            <button
              onClick={() => setView("past")}
              className={`
                px-6 py-2 rounded-md font-medium transition-all duration-200
                ${view === "past"
                  ? "bg-white text-indigo-600 shadow"
                  : "text-gray-600 hover:text-gray-900"}
              `}
            >
              <BsClockHistory className="inline mr-2" />
              Past Contests
            </button>
          </div>


          {/* Tabs - Only show for upcoming contests */}
          {view === "upcoming" && (
            <div className={styles.tabsContainer}>
              {tabs.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  // Disable tabs for AtCoder/HackerEarth if in fallback mode
                  disabled={isFallback && (f === "atcoder" || f === "hackerearth")}
                  className={`
                    ${styles.tab} 
                    ${filter === f ? styles.activeTab : ""}
                    ${(isFallback && (f === "atcoder" || f === "hackerearth")) ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  {f === "all" ? "All Platforms" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Content - Either Upcoming Contests or Past Contests */}
          {view === "upcoming" ? (
            // Upcoming Contests Grid
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                {loading ? "Loading Schedule..." : `Upcoming Events (${filteredContests.length})`}
              </h2>

              <div className={styles.grid}>
                {loading ? (
                  [1, 2, 3].map((n) => <div key={n} className={styles.skeletonCard}></div>)
                ) : filteredContests.length > 0 ? (
                  filteredContests.map((contest, idx) => (
                    <div key={idx} className={styles.card}>
                      <div className={styles.cardHeader}>
                        <div className={styles.platformLogoWrapper}>
                          {getPlatformLogo(contest.platform)}
                        </div>

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
          ) : (
            // Past Contests Component
            <PastContestsList />
          )}

          {/* Footer - Only show for upcoming */}
          {view === "upcoming" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <BsBook className="text-indigo-500" /> Editorials
              </h2>
              <div className={styles.solutionsPlaceholder}>
                <p>💡 Solutions and editorials will appear here after contests conclude.</p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default ContestsList;