import React, { useEffect, useState, useCallback } from "react";
import { getPOTD } from "../services/potd_fetch";
import { doc, getDoc, setDoc, onSnapshot, increment, runTransaction, collection, query, where, getDocs, limit } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import styles from "../styles/POTDpage.module.css";
import Image from "next/image";
import { formatDescription } from "../utils/formatDescription";
import { toast } from "sonner";
import { checkCodeforcesSubmission } from "../services/codeforces_api";
import { FiCheck, FiAward, FiClock, FiExternalLink, FiZap, FiTarget, FiTrendingUp } from "react-icons/fi";
import { BsLightningCharge } from "react-icons/bs";

interface Solver {
  uid: string;
  username: string;
  solvedAt: string | Date;
  codeforcesUsername?: string;
  isFallback?: boolean;
}

interface Problem {
  id: string;
  title: string;
  description?: string;
  rating?: number;
  tags?: string[];
  problemUrl?: string;
}

interface UserData {
  uid?: string;
  coins: number;
  totalCoins?: number;
  streak: number;
  weeklyPotdSolves?: number;
  lastWeeklyResetDate?: string;
  lastSolvedDate?: string;
  username?: string;
  isFallback?: boolean;
}

const getLocalDateString = (date: Date = new Date()): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const getStartOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return getLocalDateString(date);
};

const POTDPage: React.FC = () => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topWeeklySolvers, setTopWeeklySolvers] = useState<UserData[]>([]);
  const [dailySolvers, setDailySolvers] = useState<Solver[]>([]);
  const [userSolved, setUserSolved] = useState(false);
  const [userData, setUserData] = useState<UserData>({ coins: 0, streak: 0 });
  const [isCheckingCF, setIsCheckingCF] = useState(false);
  const [cfUsername, setCfUsername] = useState<string>("");

  const todayDate = getLocalDateString();
  const displayDate = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  useEffect(() => {
    async function fetchPOTD() {
      try {
        const id = await getPOTD();
        if (!id || typeof id !== "string") throw new Error("Invalid POTD ID");
        const ref = doc(db, "problems", id);
        const snapshot = await getDoc(ref);
        if (!snapshot.exists()) throw new Error("Problem not found");
        const data = snapshot.data();
        setProblem({
          id, title: data.title, description: data.description, rating: data.rating, tags: data.tags, problemUrl: data.problemUrl
        });
      } catch (err: any) { setError(err.message || "Error fetching POTD"); } finally { setLoading(false); }
    }
    fetchPOTD();

    const currentStartOfWeek = getStartOfWeek(new Date());
    const weeklyQ = query(
      collection(db, "users"),
      where("lastWeeklyResetDate", "==", currentStartOfWeek)
    );
    const unsubWeekly = onSnapshot(weeklyQ, async (snap: any) => {
      let solvers = snap.docs.map((d: any) => ({ ...d.data(), uid: d.id } as UserData));

      if (solvers.length < 3) {
        // Fallback: fetch additional users from Users collection to fill until at least 3
        const fallbackQ = query(collection(db, "users"), limit(10));
        const fallbackSnap = await getDocs(fallbackQ);
        const fallbackUsers = fallbackSnap.docs
          .map((d: any) => ({ ...d.data(), uid: d.id } as UserData))
          .filter((u: UserData) => !solvers.some((s: UserData) => s.uid === u.uid));

        while (solvers.length < 3 && fallbackUsers.length > 0) {
          const nextUser = fallbackUsers.shift();
          if (nextUser) {
            solvers.push({
              ...nextUser,
              weeklyPotdSolves: 0,
              streak: 0,
              coins: 0,
              isFallback: true
            });
          }
        }
      }

      solvers.sort((a: UserData, b: UserData) => (b.weeklyPotdSolves || 0) - (a.weeklyPotdSolves || 0));
      setTopWeeklySolvers(solvers.slice(0, 10));
    }, (err: any) => console.error("Error watching weekly solvers", err));

    return () => unsubWeekly();
  }, []);

  useEffect(() => {
    if (!problem?.id) return;
    const submissionRef = doc(db, "potd_submissions", todayDate);
    const unsubscribe = onSnapshot(submissionRef, async (docSnap) => {
      let solversArray: Solver[] = [];
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data?.problemId === problem?.id) {
          solversArray = Object.entries(data?.solvers || {}).map(([uid, value]: [string, any]) => ({
            uid, username: value.username, solvedAt: value.solvedAt, codeforcesUsername: value.codeforcesUsername
          }));
        }
      } else {
        setDoc(submissionRef, { problemId: problem?.id || "", solvers: {} }, { merge: true });
      }

      if (solversArray.length < 3) {
        // Fallback: fetch additional users to fill until at least 3
        const fallbackQ = query(collection(db, "users"), limit(10));
        const fallbackSnap = await getDocs(fallbackQ);
        const fallbackUsers = fallbackSnap.docs
          .map((d: any) => ({ uid: d.id, username: d.data().username || "User" }))
          .filter((u: any) => !solversArray.some((s: Solver) => s.uid === u.uid));

        while (solversArray.length < 3 && fallbackUsers.length > 0) {
          const nextUser = fallbackUsers.shift();
          if (nextUser) {
            solversArray.push({
              uid: nextUser.uid,
              username: nextUser.username,
              solvedAt: new Date().toISOString(), // Placeholder time for fallback
              isFallback: true
            });
          }
        }
      }

      solversArray.sort((a, b) => new Date(a.solvedAt).getTime() - new Date(b.solvedAt).getTime());
      setDailySolvers(solversArray);
      setUserSolved(auth.currentUser ? solversArray.some((s) => s.uid === auth.currentUser?.uid) : false);
    });
    return () => unsubscribe();
  }, [todayDate, problem?.id]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserData;
        setUserData({ coins: data.coins || 0, streak: data.streak || 0, lastSolvedDate: data.lastSolvedDate, username: data.username });
        setCfUsername(data.username || "");
      }
    });
    return () => unsubscribe();
  }, [auth.currentUser]);

  const handleCheckCFSubmission = useCallback(async () => {
    if (!auth.currentUser || !problem || userSolved || isCheckingCF) return;
    if (!cfUsername) { toast.error("Please set your Codeforces username in settings"); return; }
    setIsCheckingCF(true);
    try {
      const urlMatch = problem.problemUrl?.match(/codeforces\.com\/problemset\/problem\/(\d+)\/([A-Z]\d?)/);
      if (!urlMatch) { toast.error("Invalid Codeforces problem URL"); return; }
      const [, contestId, problemIndex] = urlMatch;
      const hasSolved = await checkCodeforcesSubmission(cfUsername, contestId, problemIndex);
      if (hasSolved) { await markAsSolved(); toast.success("🎉 Verified! Solution found!"); }
      else { toast.error("No accepted submission found today."); }
    } catch (error: any) { toast.error(error.message); } finally { setIsCheckingCF(false); }
  }, [auth.currentUser, problem, cfUsername, userSolved, isCheckingCF]);

  const markAsSolved = async () => {
    if (!auth.currentUser || !problem || userSolved) return;
    try {
      const submissionRef = doc(db, "potd_submissions", todayDate);
      const userRef = doc(db, "users", auth.currentUser.uid);
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const currentUserData = userDoc.exists() ? userDoc.data() as UserData : { coins: 0, totalCoins: 0, streak: 0 };
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        let newStreak = 1;
        if (currentUserData.lastSolvedDate === yesterdayStr) newStreak = (currentUserData.streak || 0) + 1;
        else if (currentUserData.lastSolvedDate === todayDate) return;

        const currentStartOfWeek = getStartOfWeek(new Date());
        let newWeeklySolves = 1;
        if (currentUserData.lastWeeklyResetDate === currentStartOfWeek) {
          newWeeklySolves = (currentUserData.weeklyPotdSolves || 0) + 1;
        }

        transaction.update(userRef, {
          coins: increment(50),
          totalCoins: increment(50),
          streak: newStreak,
          lastSolvedDate: todayDate,
          weeklyPotdSolves: newWeeklySolves,
          lastWeeklyResetDate: currentStartOfWeek
        });
        transaction.set(submissionRef, {
          problemId: problem.id,
          solvers: { [auth.currentUser!.uid]: { uid: auth.currentUser!.uid, username: userData.username || auth.currentUser!.displayName || "User", solvedAt: new Date().toISOString() } }
        }, { merge: true });
      });
    } catch (error) { toast.error('Failed to save progress.'); }
  };

  const getDifficulty = (rating?: number) => {
    if (!rating) return "Unknown";
    if (rating < 1200) return "Easy";
    if (rating < 1600) return "Medium";
    return "Hard";
  };

  if (loading) return <div className={styles.pageContainer}><div className={styles.main}>Loading mission...</div></div>;
  if (error || !problem) return <div className={styles.pageContainer}><div className={styles.main}>Error: {error || "Problem not found"}</div></div>;

  const difficulty = getDifficulty(problem.rating);
  // No longer truncating description to provide full mission details in the dashboard
  const fullDesc = problem.description || "";

  return (
    <div className={styles.pageContainer}>
      <main className={styles.main}>
        <div className={styles.container}>

          {/* High-Impact Header */}
          <header className={styles.header}>
            <div className={styles.headerText}>
              <h1 className={styles.title}>
                <span className={styles.titleIcon}>🎯</span> Problem of the Day
              </h1>
              <p className={styles.subtitle}>{displayDate} — Complete your daily trial.</p>
              <p className={styles.descriptionText}>
                Master a new algorithmic challenge every 24 hours. Boost your rating,
                earn coins, and maintain your streak to climb the elite leaderboard.
              </p>
            </div>
            <div className={styles.headerImage}>
              <Image
                src="/images/think.png"
                alt="POTD Mascot"
                width={300}
                height={300}
                priority
                className={styles.mascotImage}
              />
            </div>
          </header>

          <div className={styles.mainGrid}>

            {/* Unified Mission Details */}
            <section className={styles.missionCard}>
              <div className={styles.missionHeader}>
                <h2 className={styles.missionTitle}>{problem.title}</h2>
                <div className={styles.missionMeta}>
                  <span className={`${styles.difficultyBadge} ${styles[difficulty.toLowerCase()]}`}>
                    {difficulty}
                  </span>
                  {problem.rating && (
                    <span className={styles.ratingText}>
                      <FiTarget /> Rating: {problem.rating}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.missionContent}>
                <div
                  className={styles.problemDescription}
                  dangerouslySetInnerHTML={{ __html: formatDescription(fullDesc) }}
                />

                {problem.tags && (
                  <div className={styles.tagsContainer}>
                    {problem.tags.slice(0, 6).map((tag) => (
                      <span key={tag} className={styles.tag}># {tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action & Stats Center */}
              <div className={styles.actionSection}>
                <div className={styles.userStatsGrid}>
                  <div className={styles.miniStat}>
                    <span className={styles.statIcon}>💰</span>
                    <div className={styles.statInfo}>
                      <span className={styles.statLabel}>Reward</span>
                      <span className={styles.statValue}>{userData.coins} Coins</span>
                    </div>
                  </div>
                  <div className={styles.miniStat}>
                    <span className={styles.statIcon}>🔥</span>
                    <div className={styles.statInfo}>
                      <span className={styles.statLabel}>Current Streak</span>
                      <span className={styles.statValue}>{userData.streak} Days</span>
                    </div>
                  </div>
                </div>

                <div className={styles.buttonGroup}>
                  <a href={`/questions/${problem.id}`} className={styles.solveButton}>
                    <FiZap /> Solve Challenge
                  </a>
                  {userSolved ? (
                    <div className={styles.solvedBanner}>
                      <FiCheck /> Verification Complete
                    </div>
                  ) : (
                    <button
                      onClick={handleCheckCFSubmission}
                      disabled={isCheckingCF}
                      className={styles.verifyButton}
                    >
                      <BsLightningCharge /> {isCheckingCF ? "Processing..." : "Verify Codeforces Submission"}
                    </button>
                  )}
                  {problem.problemUrl && (
                    <a
                      href={problem.problemUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.tag}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white' }}
                    >
                      <FiExternalLink /> View on Codeforces
                    </a>
                  )}
                </div>
              </div>
            </section>

            {/* Sidebar Leaderboards */}
            <aside className={styles.rightColumn}>

              {/* Daily Top Solvers */}
              <div className={styles.sidebarCard}>
                <div className={styles.sidebarHeader}>
                  <h3 className={styles.sidebarTitle}><FiAward /> Top Solvers</h3>
                  <span className={styles.countBadge}>{dailySolvers.length}</span>
                </div>
                <ul className={styles.solversList}>
                  {dailySolvers.length > 0 ? (
                    dailySolvers.slice(0, 5).map((s, i) => (
                      <li key={s.uid} className={styles.solverItem}>
                        <div className={styles.solverInfo}>
                          <span className={styles.rank}>#{i + 1}</span>
                          <span className={styles.username}>{s.username}</span>
                        </div>
                        <span className={styles.solveTime}>
                          {s.isFallback ? "-" : new Date(s.solvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                      No solvers today yet.
                    </li>
                  )}
                </ul>
              </div>

              {/* Weekly Hall of Fame */}
              <div className={styles.sidebarCard}>
                <div className={styles.sidebarHeader}>
                  <h3 className={styles.sidebarTitle}><FiTrendingUp style={{ color: '#8b5cf6' }} /> Weekly Top</h3>
                  <span className={styles.countBadge}>{topWeeklySolvers.length}</span>
                </div>
                <ul className={styles.solversList}>
                  {topWeeklySolvers.length > 0 ? (
                    topWeeklySolvers.map((s, i) => (
                      <li key={s.uid} className={styles.solverItem}>
                        <div className={styles.solverInfo}>
                          <span className={styles.rank}>#{i + 1}</span>
                          <span className={styles.username}>{s.username || "User"}</span>
                        </div>
                        <span className={styles.solveCount}>
                          {s.isFallback ? "-" : `${s.weeklyPotdSolves} ${s.weeklyPotdSolves === 1 ? 'Day' : 'Days'}`}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                      Starting a new week!
                    </li>
                  )}
                </ul>
              </div>

            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default POTDPage;
