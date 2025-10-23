import { useState, useEffect } from "react";
import styles from "./ContestsSidebar.module.css";
import type { Contest, ContestsResponse } from "../../../pages/api/contests";
import { BsTrophy, BsCalendar3, BsClock, BsLightbulb, BsStarFill } from "react-icons/bs";
import { FaUserFriends } from "react-icons/fa";

export function ContestsSidebar() {
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
        // Limit to first 5 contests for sidebar display
        setContests((data.contests || []).slice(0, 5));
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const formattedDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000); // add 5.5 hours

    return formattedDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isContestToday = (dateString: string): boolean => {
    const contestDate = new Date(dateString);
    const today = new Date();
    return contestDate.toDateString() === today.toDateString();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <BsTrophy className={styles.headerIcon} />
          <h3 className={styles.title}>Contests</h3>
        </div>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <BsTrophy className={styles.headerIcon} />
          <h3 className={styles.title}>Contests</h3>
        </div>
        <div className={styles.error}>Failed to load</div>
      </div>
    );
  }

  // Mock data for suggestions and rating
  const suggestions = [
    { id: 1, name: "Dynamic Programming", count: 24 },
    { id: 2, name: "Graph Theory", count: 18 },
    { id: 3, name: "Binary Search", count: 15 },
  ];

  if (loading) {
    return (
      <div className={styles.container}>
        <div>Loading contests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className="text-red-500">Error loading contests</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Suggestions Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaUserFriends className="mr-2 text-blue-600" />
            Suggested Topics
          </h3>
          <button className="text-sm text-blue-600 hover:text-blue-800">See All</button>
        </div>
        <div className="space-y-2">
          {suggestions.map((topic) => (
            <div key={topic.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-gray-700">{topic.name}</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {topic.count} problems
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rating Box */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 text-white mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Your Rating</h3>
          <BsStarFill className="text-yellow-400" />
        </div>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold">1,524</span>
          <span className="ml-2 text-sm text-blue-100">+24 this week</span>
        </div>
        <button className="mt-3 w-full bg-white text-blue-800 font-medium py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors">
          View Progress
        </button>
      </div>

      {/* Contests Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <BsTrophy className="mr-2 text-blue-600" />
            Upcoming Contests
          </h3>
          <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
        </div>
      
      <div className={styles.contestsList}>
        {contests.length === 0 ? (
          <div className={styles.noContests}>No upcoming contests</div>
        ) : (
          contests.map((contest: Contest, index: number) => (
            <a
              key={index}
              href={contest.contestLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.contestCard} ${
                isContestToday(contest.startTime) ? styles.todayContest : ""
              }`}
            >
              <div className={styles.contestHeader}>
                <span className={styles.platform}>{contest.platform}</span>
                {isContestToday(contest.startTime) && (
                  <span className={styles.todayBadge}>Today</span>
                )}
              </div>
              
              <h4 className={styles.contestName}>{contest.contestName}</h4>
              
              <div className={styles.contestDetails}>
                <div className={styles.timeInfo}>
                  <BsCalendar3 className={styles.icon} />
                  <span className={styles.startTime}>
                    {formatDate(contest.startTime)}
                  </span>
                </div>
                
                <div className={styles.durationInfo}>
                  <BsClock className={styles.icon} />
                  <span className={styles.duration}>
                    {contest.contestDuration}
                  </span>
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}

      {contests.length > 0 && (
        <div className={styles.footer}>
          <a href="/contests-list" className={styles.viewAllLink}>
            View All Contests →
          </a>
        </div>
      )}
    </div>
  );
}
