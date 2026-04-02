import React, { useEffect, useState } from "react";
import NavigationMenu from "../common/components/NavigationMenu/NavigationMenu";
import styles from "../styles/Leaderboard.module.css";
import { collection, query, getDocs, getDoc, doc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "../lib/firebase";
import { FaCoins, FaMedal, FaFire } from "react-icons/fa";

interface LeaderboardUser {
    uid: string;
    username: string;
    totalCoins: number;
    solved: number;
    streak: number;
    lastSolvedDate?: string;
    photoURL?: string;
}

function isStreakActive(lastSolvedDate?: string): boolean {
    if (!lastSolvedDate) return false;
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const fmt = (d: Date) => d.toISOString().split("T")[0];

    return lastSolvedDate === fmt(today) || lastSolvedDate === fmt(yesterday);
}

type TabType = "earners" | "solvers";

export default function LeaderboardPage() {
    const [activeTab, setActiveTab] = useState<TabType>("earners");
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    const [myRank, setMyRank] = useState<{ rank: number; data: LeaderboardUser } | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoadingAuth(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        async function fetchLeaderboard() {
            setLoading(true);
            setMyRank(null);

            try {
                const usersRef = collection(db, "users");
                const q = query(usersRef);

                const snap = await getDocs(q);

                const fetchedUsers: LeaderboardUser[] = snap.docs.map((docSnap) => {
                    const data = docSnap.data();

                    return {
                        uid: docSnap.id,
                        username: data.username || "Unknown Soldier",
                        totalCoins: data.totalCoins || data.coins || 0,
                        solved: data.cachedStats?.solved || 0,
                        streak: data.streak || 0,
                        lastSolvedDate: data.lastSolvedDate || "",
                        photoURL: data.photoURL
                    };
                });

                // sort leaderboard
                if (activeTab === "earners") {
                    fetchedUsers.sort((a, b) => b.totalCoins - a.totalCoins);
                } else {
                    fetchedUsers.sort((a, b) => b.solved - a.solved);
                }

                setUsers(fetchedUsers);

                if (currentUser) {
                    const myIndex = fetchedUsers.findIndex((u) => u.uid === currentUser.uid);

                    if (myIndex > 24 || myIndex === -1) {
                        const myDocRef = doc(db, "users", currentUser.uid);
                        const myDocSnap = await getDoc(myDocRef);

                        if (myDocSnap.exists()) {
                            const myData = myDocSnap.data();

                            const myStats: LeaderboardUser = {
                                uid: currentUser.uid,
                                username: myData.username || currentUser.displayName || "Me",
                                totalCoins: myData.totalCoins || myData.coins || 0,
                                solved: myData.cachedStats?.solved || 0,
                                streak: myData.streak || 0,
                                lastSolvedDate: myData.lastSolvedDate || "",
                                photoURL: myData.photoURL || currentUser.photoURL
                            };

                            const rank = myIndex === -1 ? fetchedUsers.length + 1 : myIndex + 1;

                            setMyRank({
                                rank,
                                data: myStats
                            });
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching leaderboard:", err);
            } finally {
                setLoading(false);
            }
        }

        if (!loadingAuth) {
            fetchLeaderboard();
        }
    }, [activeTab, currentUser, loadingAuth]);

    return (
        <div className={styles.pageContainer}>
            <NavigationMenu />

            <div className={styles.contentWrapper}>
                <div className={styles.heroSection}>
                    <div>
                        <h1 className={styles.heroTitle}>Global Rankings</h1>
                        <p className={styles.heroSubtitle}>
                            Compete with the best. Climb the ladder.
                        </p>
                    </div>
                </div>

                <div className={styles.tabsContainer}>
                    <button
                        className={`${styles.tab} ${
                            activeTab === "earners" ? styles.tabActive : ""
                        }`}
                        onClick={() => setActiveTab("earners")}
                    >
                        <FaCoins /> Top Coin Earners
                    </button>

                    <button
                        className={`${styles.tab} ${
                            activeTab === "solvers" ? styles.tabActive : ""
                        }`}
                        onClick={() => setActiveTab("solvers")}
                    >
                        <FaMedal /> Top Problem Solvers
                    </button>
                </div>

                <div className={styles.leaderboardCard}>
                    <div className={styles.listHeader}>
                        <div>Rank</div>
                        <div>User</div>
                        <div>{activeTab === "earners" ? "Coins" : "Solved"}</div>
                        <div style={{ textAlign: "right" }}>Streak</div>
                    </div>

                    {loading ? (
                        <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
                            Loading leaders...
                        </div>
                    ) : users.length > 0 ? (
                        users.map((user, index) => {
                            const isMe = currentUser?.uid === user.uid;

                            return (
                                <div
                                    key={user.uid}
                                    className={`${styles.listItem} ${
                                        isMe ? styles.highlightUser : ""
                                    }`}
                                >
                                    <div
                                        className={`${styles.rankBadge} ${
                                            index === 0
                                                ? styles.rank1
                                                : index === 1
                                                ? styles.rank2
                                                : index === 2
                                                ? styles.rank3
                                                : ""
                                        }`}
                                    >
                                        #{index + 1}
                                    </div>

                                    <div className={styles.userInfo}>
                                        <div className={styles.avatar}>
                                            {user.photoURL ? (
                                                <img
                                                    src={user.photoURL}
                                                    alt="avatar"
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        borderRadius: "50%",
                                                        objectFit: "cover"
                                                    }}
                                                />
                                            ) : (
                                                user.username.charAt(0).toUpperCase()
                                            )}
                                        </div>

                                        <span className={styles.username}>
                                            {user.username}
                                            {isMe && (
                                                <span
                                                    style={{
                                                        color: "#2563eb",
                                                        marginLeft: "0.5rem",
                                                        fontSize: "0.8rem"
                                                    }}
                                                >
                                                </span>
                                            )}
                                        </span>
                                    </div>

                                    <div className={styles.metricValue}>
                                        {activeTab === "earners" ? (
                                            <>
                                                <span style={{ color: "#fbbf24" }}>💰</span>{" "}
                                                {user.totalCoins}
                                            </>
                                        ) : (
                                            <>
                                                <FaMedal style={{ color: "#3b82f6" }} />{" "}
                                                {user.solved}
                                            </>
                                        )}
                                    </div>

                                    <div className={styles.streakValue}>
                                        {user.streak > 0 &&
                                        isStreakActive(user.lastSolvedDate) ? (
                                            <>
                                                <FaFire /> {user.streak}
                                            </>
                                        ) : (
                                            <span style={{ color: "#cbd5e1" }}>-</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
                            No users found for this category.
                        </div>
                    )}
                </div>

                {myRank && !loading && (
                    <div className={styles.myRankBanner}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div
                                style={{
                                    background: "rgba(255,255,255,0.2)",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "8px",
                                    fontWeight: "bold"
                                }}
                            >
                                #{myRank.rank}
                            </div>

                            <div>
                                <div style={{ fontWeight: 600 }}>Your Standing</div>
                                <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                                    Keep grinding to reach Top 25!
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "2rem" }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                                    {activeTab === "earners" ? "Coins" : "Solved"}
                                </div>

                                <div style={{ fontWeight: 800, fontSize: "1.2rem" }}>
                                    {activeTab === "earners"
                                        ? myRank.data.totalCoins
                                        : myRank.data.solved}
                                </div>
                            </div>

                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                                    Streak
                                </div>

                                <div style={{ fontWeight: 800, fontSize: "1.2rem" }}>
                                    {myRank.data.streak > 0 &&
                                    isStreakActive(myRank.data.lastSolvedDate)
                                        ? `🔥 ${myRank.data.streak}`
                                        : "-"}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}