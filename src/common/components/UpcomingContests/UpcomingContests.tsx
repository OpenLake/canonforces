import { useState, useEffect } from "react";
import styles from "./UpcomingContests.module.css";

// Updated Interface to match your new API response
interface Contest {
  platform: string;
  contestName: string;
  contestLink: string;
  startTime: number; // Now a timestamp (number)
  duration: number;  // Now in milliseconds (number)
}

interface ContestsResponse {
  contests: Contest[];
}

export function UpcomingContests() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await fetch("/api/contests");

        if (!response.ok) {
          throw new Error("Failed to fetch contests");
        }

        const data: ContestsResponse = await response.json();
        setContests(data.contests || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  // Helper: Format raw milliseconds into readable string (e.g., "2h 30m")
  const formatDuration = (ms: number): string => {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`;
  };

  // Helper: Format timestamp to local readable string
  const formatDate = (ts: number): string => {
    return new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div>
        <h3 className={styles.title}>Upcoming Contests</h3>
        <div className={styles.loading}>Loading contests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h3 className={styles.title}>Upcoming Contests</h3>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <h3 className={styles.title}>Upcoming Contests</h3>
      <div className={styles.contestsList}>
        {contests.length === 0 ? (
          <div className={styles.noContests}>No upcoming contests</div>
        ) : (
          contests.map((contest, index) => (
            <a
              key={index}
              href={contest.contestLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contestCard}
            >
              <div className={styles.contestHeader}>
                {/* Capitalize platform name for better look */}
                <span className={styles.platform}>
                  {contest.platform.charAt(0).toUpperCase() + contest.platform.slice(1)}
                </span>
                
                {/* We now format the duration on the fly */}
                <span className={styles.duration}>
                  {formatDuration(contest.duration)}
                </span>
              </div>
              
              <h4 className={styles.contestName}>{contest.contestName}</h4>
              
              {/* We now format the start time on the fly */}
              <p className={styles.startTime}>
                {formatDate(contest.startTime)}
              </p>
            </a>
          ))
        )}
      </div>
    </div>
  );
}