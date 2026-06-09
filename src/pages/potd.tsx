import React, { useEffect, useState, useCallback } from "react";
import { getPOTD } from "../services/potd_fetch";
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, runTransaction } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth"; // MUST IMPORT THIS
import { db, auth } from "../lib/firebase";
import styles from "../styles/POTDpage.module.css";
import Image from "next/image";
import { formatDescription } from "../utils/formatDescription";
import { toast } from "sonner";
import { checkCodeforcesSubmission } from "../services/codeforces_api";
import { FiCheck, FiAward, FiExternalLink, FiZap, FiTarget, FiTrendingUp } from "react-icons/fi";
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
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

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
  
  // 1. REACT STATE FOR AUTH (Fixes the stale auth bug)
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  const todayDate = getLocalDateString();
  const displayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  // 2. FIREBASE AUTH LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (!user) {
        setUserData({ coins: 0, streak: 0 });
        setCfUsername("");
        setUserSolved(false);
      }
    });
    return () => unsubscribe();
  }, []);

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
          id, title: data.title, description: data.description, rating: data.rating, tags: data.tags, problemUrl: data.problemUrl,
        });
      } catch (err: any) {
        setError(err.message || "Error fetching POTD");
      } finally {
        setLoading(false);
      }
    }
    fetchPOTD();

    const currentStartOfWeek = getStartOfWeek(new Date());
    const weeklyQ = query(
      collection(db, "users"),
      where("lastWeeklyResetDate", "==", currentStartOfWeek)
    );
    const unsubWeekly = onSnapshot(
      weeklyQ,
      (snap: any) => {
        let solvers = snap.docs.map((d: any) => ({ ...d.data(), uid: d.id } as UserData));
        solvers.sort((a: UserData, b: UserData) => (b.weeklyPotdSolves || 0) - (a.weeklyPotdSolves || 0));
        setTopWeeklySolvers(solvers);
      },
      (err: any) => console.error("Error watching weekly solvers", err)
    );

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
          solversArray = Object.entries(data?.solvers || {}).map(
            ([uid, value]: [string, any]) => ({
              uid, username: value.username, solvedAt: value.solvedAt, codeforcesUsername: value.codeforcesUsername,
            })
          );
        }
      } else {
        setDoc(submissionRef, { problemId: problem?.id || "", solvers: {} }, { merge: true });
      }

      solversArray.sort((a, b) => new Date(a.solvedAt as string).getTime() - new Date(b.solvedAt as string).getTime());
      setDailySolvers(solversArray);
      setUserSolved(currentUser ? solversArray.some((s) => s.uid === currentUser.uid) : false);
    });
    return () => unsubscribe();
  }, [todayDate, problem?.id, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserData;
        setUserData({
          coins: data.coins || 0, streak: data.streak || 0, lastSolvedDate: data.lastSolvedDate, username: data.username,
        });
        setCfUsername(data.username || "");
      }
    });
    return () => unsubscribe();
  }, [currentUser]);

  // 3. THROW ERROR INSTEAD OF SILENT RETURN (Fixes Fake Success)
  const markAsSolved = useCallback(async () => {
    if (!currentUser || !problem || userSolved) {
      throw new Error("Unable to save: Session expired or already verified.");
    }

    const submissionRef = doc(db, "potd_submissions", todayDate);
    const userRef = doc(db, "users", currentUser.uid);

    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const currentUserData = userDoc.exists()
        ? (userDoc.data() as UserData)
        : { coins: 0, totalCoins: 0, streak: 0 };

      if (currentUserData.lastSolvedDate === todayDate) {
        throw new Error("You have already verified today's POTD.");
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterday);

      const newStreak = currentUserData.lastSolvedDate === yesterdayStr ? (currentUserData.streak || 0) + 1 : 1;

      const currentStartOfWeek = getStartOfWeek(new Date());
      const newWeeklySolves = currentUserData.lastWeeklyResetDate === currentStartOfWeek ? (currentUserData.weeklyPotdSolves || 0) + 1 : 1;

      const resolvedUsername =
        userData.username ||
        currentUser.displayName ||
        (currentUser.email ? currentUser.email.split("@")[0] : "User");

      transaction.set(
        userRef,
        {
          coins: (currentUserData.coins || 0) + 50, totalCoins: (currentUserData.totalCoins || 0) + 50,
          streak: newStreak, lastSolvedDate: todayDate, weeklyPotdSolves: newWeeklySolves, lastWeeklyResetDate: currentStartOfWeek,
        },
        { merge: true }
      );

      transaction.set(
        submissionRef,
        {
          problemId: problem.id,
          solvers: {
            [currentUser.uid]: {
              uid: currentUser.uid, username: resolvedUsername, solvedAt: new Date().toISOString(),
            },
          },
        },
        { merge: true }
      );
    });
  }, [currentUser, problem, userSolved, todayDate, userData.username]);

  const handleCheckCFSubmission = useCallback(async () => {
    if (!currentUser || !problem || userSolved || isCheckingCF) return;

    const usernameToCheck = userData.username || cfUsername;
    if (!usernameToCheck) {
      toast.error("Please set your Codeforces username in settings");
      return;
    }

    setIsCheckingCF(true);
    try {
      const urlMatch = problem.problemUrl?.match(/codeforces\.com\/problemset\/problem\/(\d+)\/([A-Z]\d?)/);
      if (!urlMatch) {
        toast.error("Invalid Codeforces problem URL");
        return;
      }
      const [, contestId, problemIndex] = urlMatch;
      const hasSolved = await checkCodeforcesSubmission(usernameToCheck, contestId, problemIndex);
      
      if (hasSolved) {
        await markAsSolved(); // If this fails, it jumps to the catch block and WON'T show success
        toast.success("🎉 Verified! Solution found and progress saved!");
      } else {
        toast.error("No accepted submission found today.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save progress");
    } finally {
      setIsCheckingCF(false);
    }
  }, [currentUser, problem, userData.username, cfUsername, userSolved, isCheckingCF, markAsSolved]);

  const getDifficulty = (rating?: number) => {
    if (!rating) return "Unknown";
    if (rating < 1200) return "Easy";
    if (rating < 1600) return "Medium";
    return "Hard";
  };

  if (loading) return <div className={styles.pageContainer}><div className={styles.main}>Loading mission...</div></div>;
  if (error || !problem) return <div className={styles.pageContainer}><div className={styles.main}>Error: {error || "Problem not found"}</div></div>;

  const difficulty = getDifficulty(problem.rating);
  const fullDesc = problem.description || "";

  return (
    <div className={styles.pageContainer}>
      <main className={styles.main}>
        <div className={styles.container}>

          <header className={styles.header}>
            <div className={styles.headerText}>
              <h1 className={styles.title}>
                <span className={styles.titleIcon}>🎯</span> Problem of the Day
              </h1>
              <p className={styles.subtitle}>{displayDate} — Complete your daily trial.</p>
              <p className={styles.descriptionText}>
                Master a new algorithmic challenge every 24 hours. Boost your rating, earn coins,
                and maintain your streak to climb the elite leaderboard.
              </p>
            </div>
            <div className={styles.headerImage}>
              <Image src="/images/think.png" alt="POTD Mascot" width={300} height={300} priority className={styles.mascotImage} />
            </div>
          </header>

          <div className={styles.mainGrid}>
            <section className={styles.missionCard}>
              <div className={styles.missionHeader}>
                <h2 className={styles.missionTitle}>{problem.title}</h2>
                <div className={styles.missionMeta}>
                  <span className={`${styles.difficultyBadge} ${styles[difficulty.toLowerCase()]}`}>{difficulty}</span>
                  {problem.rating && (
                    <span className={styles.ratingText}><FiTarget /> Rating: {problem.rating}</span>
                  )}
                </div>
              </div>

              <div className={styles.missionContent}>
                <div className={styles.problemDescription} dangerouslySetInnerHTML={{ __html: formatDescription(fullDesc) }} />
                {problem.tags && (
                  <div className={styles.tagsContainer}>
                    {problem.tags.slice(0, 6).map((tag) => (
                      <span key={tag} className={styles.tag}># {tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.actionSection}>
                <div className={styles.userStatsGrid}>
                  <div className={styles.miniStat}>
                    <span className={styles.statIcon}>💰</span>
                    <div className={styles.statInfo}>
                      <span className={styles.statLabel}>Coins</span>
                      <span className={styles.statValue}>{userData.coins}</span>
                    </div>
                  </div>
                  <div className={styles.miniStat}>
                    <span className={styles.statIcon}>🔥</span>
                    <div className={styles.statInfo}>
                      <span className={styles.statLabel}>Streak</span>
                      <span className={styles.statValue}>{userData.streak} Days</span>
                    </div>
                  </div>
                </div>

                <div className={styles.buttonGroup}>
                  <a href={`/questions/${problem.id}`} className={styles.solveButton}><FiZap /> Solve Challenge</a>
                  {userSolved ? (
                    <div className={styles.solvedBanner}><FiCheck /> Verification Complete</div>
                  ) : (
                    <button onClick={handleCheckCFSubmission} disabled={isCheckingCF} className={styles.verifyButton}>
                      <BsLightningCharge /> {isCheckingCF ? "Processing..." : "Verify Codeforces Submission"}
                    </button>
                  )}
                  {problem.problemUrl && (
                    <a href={problem.problemUrl} target="_blank" rel="noopener noreferrer" className={styles.tag} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "white" }}>
                      <FiExternalLink /> View on Codeforces
                    </a>
                  )}
                </div>
              </div>
            </section>

            <aside className={styles.rightColumn}>
              <div className={styles.sidebarCard}>
                <div className={styles.sidebarHeader}>
                  <h3 className={styles.sidebarTitle}><FiAward /> Top Solvers</h3>
                  <span className={styles.countBadge}>{dailySolvers.length}</span>
                </div>
                <ul className={styles.solversList}>
                  {dailySolvers.length > 0 ? (
                    dailySolvers.map((s, i) => (
                      <li key={s.uid} className={styles.solverItem}>
                        <div className={styles.solverInfo}>
                          <span className={styles.rank}>#{i + 1}</span>
                          <span className={styles.username}>{s.username}</span>
                        </div>
                        <span className={styles.solveTime}>
                          {s.isFallback ? "-" : new Date(s.solvedAt as string).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li style={{ textAlign: "center", padding: "1rem", color: "#94a3b8", fontSize: "0.9rem" }}>
                      No solvers today yet.
                    </li>
                  )}
                </ul>
              </div>

              <div className={styles.sidebarCard}>
                <div className={styles.sidebarHeader}>
                  <h3 className={styles.sidebarTitle}><FiTrendingUp style={{ color: "#8b5cf6" }} /> Weekly Top</h3>
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
                          {s.isFallback ? "-" : `${s.weeklyPotdSolves} ${s.weeklyPotdSolves === 1 ? "Day" : "Days"}`}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li style={{ textAlign: "center", padding: "1rem", color: "#94a3b8", fontSize: "0.9rem" }}>
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