import { useState, useEffect } from 'react';
import styles from './UpcomingContests.module.css';
import type { Contest, ContestsResponse } from '../../../pages/api/contests';

export function UpcomingContests() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await fetch('/api/contests');
        
        if (!response.ok) {
          throw new Error('Failed to fetch contests');
        }
        
        const data: ContestsResponse = await response.json();
        setContests(data.contests || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
          contests.map((contest: Contest, index: number) => (
            <a
              key={index}
              href={contest.contestLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contestCard}
            >
              <div className={styles.contestHeader}>
                <span className={styles.platform}>{contest.platform}</span>
                <span className={styles.duration}>{contest.contestDuration}</span>
              </div>
              <h4 className={styles.contestName}>{contest.contestName}</h4>
              <p className={styles.startTime}>{formatDate(contest.startTime)}</p>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
