import React, { useEffect, useState, useCallback } from "react";
import { getPOTD } from "../services/potd_fetch";
import { doc, getDoc, setDoc, onSnapshot, increment, updateDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import styles from "../styles/POTDpage.module.css";
import Image from "next/image";
import { formatDescription } from "../utils/formatDescription";
import { toast } from "sonner";
import { checkCodeforcesSubmission } from "../services/codeforces_api";

// --- Types ---
interface Solver {
  uid: string;
  username: string;
  solvedAt: string | Date;
  codeforcesUsername?: string;
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
  coins: number;
  streak: number;
  lastSolvedDate?: string;
  username?: string;
}

// --- Icons ---
const FiRefreshCw = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);

const FiCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className={styles.calendarIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const POTDPage: React.FC = () => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailySolvers, setDailySolvers] = useState<Solver[]>([]);
  const [userSolved, setUserSolved] = useState(false);
  const [userData, setUserData] = useState<UserData>({ coins: 0, streak: 0 });
  const [isCheckingCF, setIsCheckingCF] = useState(false);
  const [cfUsername, setCfUsername] = useState<string>("");

  const todayDate = new Date().toISOString().split("T")[0];

  // Truncate description to first N characters
  const truncateDescription = (desc: string, maxLength: number = 400): string => {
    if (!desc) return "";
    const stripped = desc.replace(/\*\*/g, '').replace(/`/g, '');
    if (stripped.length <= maxLength) return desc;
    
    const truncated = desc.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return truncated.substring(0, lastSpace) + '...';
  };

  // Fetch POTD
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
          id, 
          title: data.title,
          description: data.description,
          rating: data.rating,
          tags: data.tags,
          problemUrl: data.problemUrl
        });
      } catch (err: any) {
        setError(err.message || "Error fetching POTD");
      } finally {
        setLoading(false);
      }
    }
    fetchPOTD();
  }, []);

  // Fetch solvers for today (real-time)
  useEffect(() => {
    if (!problem?.id) return;

    const submissionRef = doc(db, "potd_submissions", todayDate);

    const unsubscribe = onSnapshot(submissionRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data?.problemId !== problem?.id) return;

        const solversData = data?.solvers || {};
        const solversArray: Solver[] = Object.entries(solversData).map(([uid, value]: [string, any]) => ({
          uid,
          username: value.username,
          solvedAt: value.solvedAt,
          codeforcesUsername: value.codeforcesUsername
        }));

        solversArray.sort((a, b) => new Date(a.solvedAt).getTime() - new Date(b.solvedAt).getTime());
        setDailySolvers(solversArray);

        const solved = auth.currentUser ? solversArray.some((s) => s.uid === auth.currentUser?.uid) : false;
        setUserSolved(solved);
      } else {
        setDoc(submissionRef, { problemId: problem?.id || "", solvers: {} }, { merge: true });
      }
    });

    return () => unsubscribe();
  }, [todayDate, problem?.id]);

  // Fetch user data
  useEffect(() => {
    if (!auth.currentUser) return;

    const userRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserData;
        setUserData({
          coins: data.coins || 0,
          streak: data.streak || 0,
          lastSolvedDate: data.lastSolvedDate,
          username: data.username
        });
        setCfUsername(data.username || "");
      }
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const handleCheckCFSubmission = useCallback(async () => {
    if (!auth.currentUser || !problem || userSolved || isCheckingCF) return;

    if (!cfUsername) {
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
      
      const hasSolved = await checkCodeforcesSubmission(cfUsername, contestId, problemIndex);
      
      if (hasSolved) {
        await markAsSolved();
        toast.success("🎉 Verified! Solution found on Codeforces!");
      } else {
        toast.error("No accepted submission found. Make sure you've solved this problem on Codeforces!");
      }
    } catch (error: any) {
      console.error('Error checking Codeforces:', error);
      toast.error(error.message || 'Failed to verify submission');
    } finally {
      setIsCheckingCF(false);
    }
  }, [auth.currentUser, problem, cfUsername, userSolved, isCheckingCF]);

  const markAsSolved = async () => {
    if (!auth.currentUser || !problem || userSolved) return;

    try {
      const submissionRef = doc(db, "potd_submissions", todayDate);
      const userRef = doc(db, "users", auth.currentUser.uid);
      
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          coins: 0,
          streak: 0,
          lastSolvedDate: null,
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName
        });
      }
      
      const currentUserData = userDoc.exists() ? userDoc.data() as UserData : { coins: 0, streak: 0 };
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      
      let newStreak = 1;
      if (currentUserData.lastSolvedDate === yesterdayStr) {
        newStreak = (currentUserData.streak || 0) + 1;
      } else if (currentUserData.lastSolvedDate === todayDate) {
        return;
      }
      
      await updateDoc(userRef, {
        coins: increment(5),
        streak: newStreak,
        lastSolvedDate: todayDate
      });
      
      await setDoc(
        submissionRef,
        {
          problemId: problem.id,
          solvers: {
            [auth.currentUser.uid]: {
              uid: auth.currentUser.uid,
              username: auth.currentUser.displayName || auth.currentUser.email?.split("@")[0],
              codeforcesUsername: cfUsername || null,
              solvedAt: new Date(),
            },
          },
        },
        { merge: true }
      );
      
      setUserSolved(true);
      setUserData(prev => ({
        ...prev,
        coins: prev.coins + 5,
        streak: newStreak
      }));
      
    } catch (error) {
      console.error('Error marking problem as solved:', error);
      toast.error('Failed to mark problem as solved. Please try again.');
    }
  };

  const getDifficulty = (rating?: number) => {
    if (!rating) return "Unknown";
    if (rating < 1200) return "Easy";
    if (rating < 1600) return "Medium";
    return "Hard";
  };

  const getDifficultyEmoji = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "🟢";
      case "Medium": return "🟠";
      case "Hard": return "🔴";
      default: return "⚪";
    }
  };

  if (loading) {
    return (
      <div className={styles.centerScreen}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loading}>Loading Problem of the Day...</p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className={styles.centerScreen}>
        <p className={styles.error}>{error || "Problem not found"}</p>
      </div>
    );
  }

  const difficulty = getDifficulty(problem.rating);
  const truncatedDesc = truncateDescription(problem.description || "", 450);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Header Badge */}
        <div className={styles.headerBadge}>
          <FiCalendar />
          <span>Problem of the Day</span>
          <span className={styles.date}>
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </span>
        </div>

        <div className={styles.contentGrid}>
          {/* Left Column - Problem Details */}
          <div className={styles.problemSection}>
            <div className={styles.problemCard}>
              <div className={styles.problemHeader}>
                <h1 className={styles.problemTitle}>{problem.title}</h1>
                <span className={`${styles.ratingBadge} ${styles[difficulty.toLowerCase()]}`}>
                  Rating: {problem.rating || "N/A"}
                </span>
              </div>

              <div 
                className={styles.description}
                dangerouslySetInnerHTML={{ __html: formatDescription(truncatedDesc) }}
              />

              {problem.tags && problem.tags.length > 0 && (
                <div className={styles.tags}>
                  {problem.tags.slice(0, 5).map((tag) => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              )}

              <div className={styles.actionSection}>
                <a 
                  href={`/questions/${problem.id}`}
                  className={styles.solveButton}
                >
                  Solve Challenge
                </a>

                {problem.problemUrl && (
                  <a 
                    href={problem.problemUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.cfButton}
                  >
                    <Image 
                      src="/logos/codeforces.png" 
                      alt="CF" 
                      width={20} 
                      height={20} 
                      className={styles.cfLogo}
                    />
                    Codeforces
                  </a>
                )}
              </div>

              {auth.currentUser && (
                <div className={styles.verificationSection}>
                  <div className={styles.statsRow}>
                    <div className={styles.statItem}>
                      <span className={styles.statEmoji}>💰</span>
                      <span className={styles.statValue}>{userData.coins}</span>
                      <span className={styles.statLabel}>coins</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statEmoji}>🔥</span>
                      <span className={styles.statValue}>{userData.streak}</span>
                      <span className={styles.statLabel}>day streak</span>
                    </div>
                  </div>

                  {!userSolved ? (
                    <button
                      onClick={handleCheckCFSubmission}
                      disabled={isCheckingCF || !cfUsername}
                      className={styles.verifyButton}
                    >
                      {isCheckingCF ? (
                        <>
                          <div className={styles.buttonSpinner}></div>
                          Checking...
                        </>
                      ) : (
                        <>
                          <FiRefreshCw className={styles.refreshIcon} />
                          Verify CF Submission
                        </>
                      )}
                    </button>
                  ) : (
                    <div className={styles.solvedBadge}>
                      <span className={styles.checkmark}>✓</span>
                      Solved!
                    </div>
                  )}

                  {!cfUsername && !userSolved && (
                    <p className={styles.cfHint}>
                      Set your Codeforces username in settings to verify submissions
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Solvers List */}
          <div className={styles.solversSection}>
            <div className={styles.solversCard}>
              <div className={styles.solversHeader}>
                <h2 className={styles.solversTitle}>Today's Solvers</h2>
                <span className={styles.solversCount}>{dailySolvers.length}</span>
              </div>

              {dailySolvers.length > 0 ? (
                <div className={styles.solversList}>
                  {dailySolvers.map((solver, i) => (
                    <div key={solver.uid} className={styles.solverItem}>
                      <div className={styles.solverRank}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                      </div>
                      <div className={styles.solverInfo}>
                        <span className={styles.solverName}>{solver.username}</span>
                        <span className={styles.solverTime}>
                          {new Date(solver.solvedAt).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noSolvers}>
                  <p>🏁 Be the first to solve today's challenge!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POTDPage;