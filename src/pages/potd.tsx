import React, { useEffect, useState, useCallback } from "react";
import { getPOTD } from "../services/potd_fetch";
import { doc, getDoc, setDoc, onSnapshot, increment, updateDoc, runTransaction } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import styles from "../styles/POTDpage.module.css";
import Image from "next/image";
import { formatDescription } from "../utils/formatDescription";
import { toast } from "sonner";
import { checkCodeforcesSubmission } from "../services/codeforces_api";
import { FiRefreshCw, FiCheck, FiAward, FiClock } from "react-icons/fi";

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
  const displayDate = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  // Truncate description
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

  // Fetch solvers for today
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
        toast.error("No accepted submission found on Codeforces for today.");
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
      
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const currentUserData = userDoc.exists() ? userDoc.data() as UserData : { coins: 0, streak: 0 };
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        
        let newStreak = 1;
        if (currentUserData.lastSolvedDate === yesterdayStr) {
          newStreak = (currentUserData.streak || 0) + 1;
        } else if (currentUserData.lastSolvedDate === todayDate) {
          return; // Already solved today
        }
        
        transaction.update(userRef, {
          coins: increment(5),
          streak: newStreak,
          lastSolvedDate: todayDate
        });
        
        transaction.set(
          submissionRef,
          {
            problemId: problem.id,
            solvers: {
              [auth.currentUser!.uid]: {
                uid: auth.currentUser!.uid,
                username: auth.currentUser!.displayName || auth.currentUser!.email?.split("@")[0],
                codeforcesUsername: cfUsername || null,
                solvedAt: new Date().toISOString(),
              },
            },
          },
          { merge: true }
        );
      });
      
    } catch (error) {
      console.error('Error marking problem as solved:', error);
      toast.error('Failed to save progress. Please try again.');
    }
  };

  const getDifficulty = (rating?: number) => {
    if (!rating) return "Unknown";
    if (rating < 1200) return "Easy";
    if (rating < 1600) return "Medium";
    return "Hard";
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className={styles.errorContainer}>
        <h3>Something went wrong</h3>
        <p>{error || "Problem not found"}</p>
      </div>
    );
  }

  const difficulty = getDifficulty(problem.rating);
  const truncatedDesc = truncateDescription(problem.description || "", 450);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        
        {/* --- Hero Section with Mascot --- */}
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h4 className={styles.heroSubtitle}>{displayDate}</h4>
            <h1 className={styles.heroTitle}>Problem of the Day</h1>
            <p className={styles.heroText}>
              Solve today's challenge to keep your streak alive and earn coins!
            </p>
          </div>
          <div className={styles.heroImageContainer}>
             <Image 
               src="/images/thinking.png" 
               alt="Thinking Mascot" 
               width={300} 
               height={300} 
               priority
               className={styles.mascotImage}
             />
          </div>
        </div>

        <div className={styles.mainGrid}>
          {/* Left Column - Problem Details */}
          <div className={styles.leftColumn}>
            <div className={styles.problemCard}>
              <div className={styles.problemHeader}>
                <div>
                  <h2 className={styles.problemTitle}>{problem.title}</h2>
                  <div className={styles.problemMeta}>
                    <span className={`${styles.difficultyBadge} ${styles[difficulty.toLowerCase()]}`}>
                      {difficulty}
                    </span>
                    {problem.rating && (
                      <span className={styles.ratingText}>Rating: {problem.rating}</span>
                    )}
                  </div>
                </div>
              </div>

              <div 
                className={styles.description}
                dangerouslySetInnerHTML={{ __html: formatDescription(truncatedDesc) }}
              />

              {problem.tags && problem.tags.length > 0 && (
                <div className={styles.tagsContainer}>
                  {problem.tags.slice(0, 5).map((tag) => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              )}

              <div className={styles.actionButtons}>
                <a href={`/questions/${problem.id}`} className={styles.primaryButton}>
                  Solve Challenge
                </a>
                {problem.problemUrl && (
                  <a 
                    href={problem.problemUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.secondaryButton}
                  >
                    <Image src="/logos/codeforces.png" alt="CF" width={20} height={20} />
                    View on Codeforces
                  </a>
                )}
              </div>
            </div>

            {/* Verification Section for Logged-in Users */}
            {auth.currentUser && (
              <div className={styles.verificationCard}>
                <div className={styles.userStatsRow}>
                  <div className={styles.userStat}>
                    <span className={styles.statIcon}>💰</span>
                    <div>
                      <div className={styles.statValue}>{userData.coins}</div>
                      <div className={styles.statLabel}>Coins</div>
                    </div>
                  </div>
                  <div className={styles.userStat}>
                    <span className={styles.statIcon}>🔥</span>
                    <div>
                      <div className={styles.statValue}>{userData.streak}</div>
                      <div className={styles.statLabel}>Day Streak</div>
                    </div>
                  </div>
                </div>

                <div className={styles.verificationAction}>
                  {userSolved ? (
                    <div className={styles.solvedMessage}>
                      <FiCheck className={styles.checkIcon} />
                      <span>You've solved today's problem!</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handleCheckCFSubmission}
                        disabled={isCheckingCF || !cfUsername}
                        className={styles.verifyButton}
                      >
                        {isCheckingCF ? (
                          <>
                            <div className={styles.buttonSpinner}></div>
                            Verifying...
                          </>
                        ) : (
                          <>
                            <FiRefreshCw /> Verify Codeforces Submission
                          </>
                        )}
                      </button>
                      {!cfUsername && (
                        <p className={styles.hintText}>
                          Link your Codeforces username in profile settings to verify.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Solvers Leaderboard */}
          <div className={styles.rightColumn}>
            <div className={styles.leaderboardCard}>
              <div className={styles.leaderboardHeader}>
                <h3 className={styles.leaderboardTitle}>
                  <FiAward className={styles.awardIcon} /> Today's Top Solvers
                </h3>
                <span className={styles.solverCountBadge}>{dailySolvers.length}</span>
              </div>

              <div className={styles.solversListContainer}>
                {dailySolvers.length > 0 ? (
                  <ul className={styles.solversList}>
                    {dailySolvers.map((solver, i) => (
                      <li key={solver.uid} className={styles.solverItem}>
                        <div className={styles.solverRank}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className={styles.numericRank}>{i + 1}</span>}
                        </div>
                        <div className={styles.solverDetails}>
                          <span className={styles.solverName}>{solver.username}</span>
                          <div className={styles.solverMeta}>
                            <FiClock className={styles.clockIcon} />
                            <time className={styles.solverTime}>
                              {new Date(solver.solvedAt).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </time>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={styles.emptyState}>
                    <Image src="/images/empty-state.svg" alt="No solvers yet" width={120} height={120} style={{opacity: 0.5}} />
                    <p>Be the first to top the leaderboard!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POTDPage;