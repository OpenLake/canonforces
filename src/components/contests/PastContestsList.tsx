import React, { useState, useEffect } from "react";
import Image from "next/image";
import { BsCalendarEvent, BsClock, BsCodeSlash } from "react-icons/bs";
import { PastContest } from "../../types/contest-submission";
import ContestProblems from "./ContestProblems";
import styles from "./PastContestsList.module.css";

interface ApiResponse {
    contests: PastContest[];
    source?: "clist" | "fallback";
}

const PastContestsList = () => {
    const [contests, setContests] = useState<PastContest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [showProblemsModal, setShowProblemsModal] = useState(false);
    const [selectedContest, setSelectedContest] = useState<PastContest | null>(null);

    useEffect(() => {
        const fetchPastContests = async () => {
            try {
                const res = await fetch("/api/past-contests");
                const data: ApiResponse = await res.json();
                setContests(data.contests || []);
            } catch (error) {
                console.error("Failed to fetch past contests", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPastContests();
    }, []);

    const formatDate = (ts: number) => {
        return new Date(ts).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

   const getTimeAgo = (ts: number) => {
        const now = Date.now();
        const diff = now - ts;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return "Today";
        if (days === 1) return "Yesterday";
        if (days < 7) return days === 1 ? `1 day ago` : `${days} days ago`;
        const weeks = Math.floor(days / 7);
        if (days < 30) return weeks === 1 ? `1 week ago` : `${weeks} weeks ago`;
        const months = Math.floor(days / 30);
        return months === 1 ? `1 month ago` : `${months} months ago`;
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
        return <BsCodeSlash className="text-blue-500" size={24} />;
    };

    const handleViewProblems = (contest: PastContest) => {
        setSelectedContest(contest);
        setShowProblemsModal(true);
    };

    const handleCloseProblemsModal = () => {
        setShowProblemsModal(false);
        setSelectedContest(null);
    };

    // Filter Logic
    const filteredContests = filter === "all"
        ? contests
        : contests.filter(c => c.platform.toLowerCase() === filter);

    const tabs = ["all", "codeforces", "leetcode", "codechef", "atcoder"];

    return (
        <div className={styles.container}>
            {/* Tabs */}
            <div className={styles.tabsContainer}>
                {tabs.map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`${styles.tab} ${filter === f ? styles.activeTab : ""}`}
                    >
                        {f === "all" ? "All Platforms" : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    {loading ? "Loading Past Contests..." : `Past Contests (${filteredContests.length})`}
                </h2>

                <div className={styles.grid}>
                    {loading ? (
                        [1, 2, 3, 4, 5, 6].map((n) => <div key={n} className={styles.skeletonCard}></div>)
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
                                        <span>{formatDate(contest.endTime)}</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <BsClock />
                                        <span>{getTimeAgo(contest.endTime)}</span>
                                    </div>
                                </div>

                                <div className={styles.buttonGroup}>
                                    <a
                                        href={contest.contestLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.cardButtonSecondary}
                                    >
                                        View Contest
                                    </a>
                                    <button
                                        onClick={() => handleViewProblems(contest)}
                                        className={styles.cardButton}
                                    >
                                        View Problems <BsCodeSlash />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>No past contests found for this platform.</div>
                    )}
                </div>
            </div>

            {/* Contest Problems Modal */}
            {showProblemsModal && selectedContest && (
                <ContestProblems
                    contest={selectedContest}
                    onClose={handleCloseProblemsModal}
                />
            )}
        </div>
    );
};

export default PastContestsList;
