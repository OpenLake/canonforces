import React, { useEffect, useState } from "react";
import NavigationMenu from "../common/components/NavigationMenu/NavigationMenu";
import styles from "../styles/Leaderboard.module.css";
import { collection, query, orderBy, limit, getDocs, getDoc, doc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "../lib/firebase";
import { FaCoins, FaMedal, FaFire } from "react-icons/fa";

interface LeaderboardUser {
    uid: string;
    username: string;
    totalCoins: number;
    solved: number;
    streak: number;
    photoURL?: string;
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
                // Fetch all users and sort locally to bypass missing index requirements
                const q = query(usersRef);

                const snap = await getDocs(q);

                const fetchedUsers: LeaderboardUser[] = snap.docs.map(docSnap => {
                    const data = docSnap.data();
                    return {
                        uid: docSnap.id,
                        username: data.username || "Unknown Soldier",
                        totalCoins: data.totalCoins || data.coins || 0,
                        solved: data.cachedStats?.solved || 0,
                        streak: data.streak || 0,
                        photoURL: data.photoURL
                    };
                });

                // Manual sort and limit to top 50 
                if (activeTab === "earners") {
                    fetchedUsers.sort((a, b) => b.totalCoins - a.totalCoins);
                } else {
                    fetchedUsers.sort((a, b) => b.solved - a.solved);
                }

                const top50 = fetchedUsers.slice(0, 50);

                setUsers(top50);

                // Check if the current user is in the top 50
                if (currentUser) {
                    const inTop50 = fetchedUsers.findIndex(u => u.uid === currentUser.uid);
                    // If they are not in the top 50, fetch their personal document to display "My Rank"
                    if (inTop50 === -1) {
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
                                photoURL: myData.photoURL || currentUser.photoURL
                            };
                            setMyRank({ rank: 50, data: myStats }); // We just show > 50 for rank
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
                        <p className={styles.heroSubtitle}>Compete with the best. Climb the ladder.</p>
                    </div>
                </div>

                <div className={styles.tabsContainer}>
                    <button
                        className={`${styles.tab} ${activeTab === "earners" ? styles.tabActive : ""} `}
                        onClick={() => setActiveTab("earners")}
                    >
                        <FaCoins /> Top Coin Earners
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === "solvers" ? styles.tabActive : ""} `}
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
                        <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>Loading leaders...</div>
                    ) : users.length > 0 ? (
                        users.map((user, index) => (
                            <div key={user.uid} className={styles.listItem}>
                                <div className={`${styles.rankBadge} ${index === 0 ? styles.rank1 : index === 1 ? styles.rank2 : index === 2 ? styles.rank3 : ""} `}>
                                    #{index + 1}
                                </div>

                                <div className={styles.userInfo}>
                                    <div className={styles.avatar}>
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                        ) : (
                                            user.username.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <span className={styles.username}>{user.username}</span>
                                </div>

                                <div className={styles.metricValue}>
                                    {activeTab === "earners" ? (
                                        <><span style={{ color: "#fbbf24" }}>💰</span> {user.totalCoins}</>
                                    ) : (
                                        <><FaMedal style={{ color: "#3b82f6" }} /> {user.solved}</>
                                    )}
                                </div>

                                <div className={styles.streakValue}>
                                    {user.streak > 0 ? <><FaFire /> {user.streak}</> : <span style={{ color: "#cbd5e1" }}>-</span>}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>No users found for this category.</div>
                    )}
                </div>

                {myRank && !loading && (
                    <div className={styles.myRankBanner}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div style={{ background: "rgba(255,255,255,0.2)", padding: "0.5rem 1rem", borderRadius: "8px", fontWeight: "bold" }}>
                                &gt; Top 50
                            </div>
                            <div>
                                <div style={{ fontWeight: 600 }}>Your Standing</div>
                                <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Keep grinding to hit the Top 50!</div>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "2rem" }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "0.8rem", opacity: 0.8, textTransform: "uppercase" }}>{activeTab === "earners" ? "Coins" : "Solved"}</div>
                                <div style={{ fontWeight: 800, fontSize: "1.2rem", display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    {activeTab === "earners" ? "💰" : "🏅"}
                                    {activeTab === "earners" ? myRank.data.totalCoins : myRank.data.solved}
                                </div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "0.8rem", opacity: 0.8, textTransform: "uppercase" }}>Streak</div>
                                <div style={{ fontWeight: 800, fontSize: "1.2rem", display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    🔥 {myRank.data.streak}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
