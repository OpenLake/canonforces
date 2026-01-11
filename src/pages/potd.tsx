import React, { useEffect, useState, useCallback } from "react";
import { getPOTD } from "../services/potd_fetch";
import { doc, getDoc, setDoc, onSnapshot, increment, runTransaction } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import styles from "../styles/POTDpage.module.css";
import Image from "next/image";
import { formatDescription } from "../utils/formatDescription";
import { toast } from "sonner";
import { checkCodeforcesSubmission } from "../services/codeforces_api";
import { FiRefreshCw, FiCheck, FiAward, FiClock } from "react-icons/fi";

// ... [Interfaces remain the same] ...
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

  // ... [Keep truncateDescription, fetchPOTD, etc. logic SAME as before] ...
  const truncateDescription = (desc: string, maxLength: number = 400): string => {
    if (!desc) return "";
    const stripped = desc.replace(/\*\*/g, '').replace(/`/g, '');
    if (stripped.length <= maxLength) return desc;
    const truncated = desc.substring(0, maxLength);
    return truncated.substring(0, truncated.lastIndexOf(' ')) + '...';
  };

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
  }, []);

  useEffect(() => {
    if (!problem?.id) return;
    const submissionRef = doc(db, "potd_submissions", todayDate);
    const unsubscribe = onSnapshot(submissionRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data?.problemId !== problem?.id) return;
        const solversArray: Solver[] = Object.entries(data?.solvers || {}).map(([uid, value]: [string, any]) => ({
          uid, username: value.username, solvedAt: value.solvedAt, codeforcesUsername: value.codeforcesUsername
        }));
        solversArray.sort((a, b) => new Date(a.solvedAt).getTime() - new Date(b.solvedAt).getTime());
        setDailySolvers(solversArray);
        setUserSolved(auth.currentUser ? solversArray.some((s) => s.uid === auth.currentUser?.uid) : false);
      } else {
        setDoc(submissionRef, { problemId: problem?.id || "", solvers: {} }, { merge: true });
      }
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

  // ... [Keep handleCheckCFSubmission and markAsSolved SAME as before] ...
  const handleCheckCFSubmission = useCallback(async () => {
      // ... logic from previous response ...
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
      // ... logic from previous response ...
      if (!auth.currentUser || !problem || userSolved) return;
      try {
        const submissionRef = doc(db, "potd_submissions", todayDate);
        const userRef = doc(db, "users", auth.currentUser.uid);
        await runTransaction(db, async (transaction) => {
          const userDoc = await transaction.get(userRef);
          const currentUserData = userDoc.exists() ? userDoc.data() as UserData : { coins: 0, streak: 0 };
          const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];
          let newStreak = 1;
          if (currentUserData.lastSolvedDate === yesterdayStr) newStreak = (currentUserData.streak || 0) + 1;
          else if (currentUserData.lastSolvedDate === todayDate) return; 
          transaction.update(userRef, { coins: increment(5), streak: newStreak, lastSolvedDate: todayDate });
          transaction.set(submissionRef, {
            problemId: problem.id,
            solvers: { [auth.currentUser!.uid]: { uid: auth.currentUser!.uid, username: auth.currentUser!.displayName || "User", solvedAt: new Date().toISOString() } }
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

  if (loading) return <div style={{padding:'4rem', textAlign:'center'}}>Loading...</div>;
  if (error || !problem) return <div style={{padding:'4rem', textAlign:'center', color:'red'}}>{error || "Problem not found"}</div>;

  const difficulty = getDifficulty(problem.rating);
  const truncatedDesc = truncateDescription(problem.description || "", 300);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        
        {/* --- Hero Section (Matches Practice Arena) --- */}
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.titleRow}>
              {/* 3D Icon matching your book style */}
              <span className={styles.titleIcon}>📅</span> 
              <h1 className={styles.heroTitle}>Problem of the Day</h1>
            </div>
            
            {/* Subtitle matching "Master algorithmic..." */}
            <h2 className={styles.heroSubtitle}>
              {displayDate} — Keep your streak alive!
            </h2>
            
            {/* Description matching "Choose your difficulty..." */}
            <p className={styles.heroText}>
              Solve today's carefully curated challenge designed to enhance your coding skills. 
              Compete with peers and climb the daily leaderboard.
            </p>
          </div>

          {/* Independent Image */}
          <Image 
            src="/images/think.png" 
            alt="Mascot" 
            width={150} 
            height={150} 
            priority
            className={styles.mascotImage}
          />
        </div>

        <div className={styles.mainGrid}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            <div className={styles.problemCard}>
              <div className={styles.problemHeader}>
                <h2 className={styles.problemTitle}>{problem.title}</h2>
                <div className={styles.problemMeta}>
                  <span className={`${styles.difficultyBadge} ${styles[difficulty.toLowerCase()]}`}>
                    {difficulty}
                  </span>
                  {problem.rating && <span className={styles.ratingText}>Rating: {problem.rating}</span>}
                </div>
              </div>

              <div className={styles.description} dangerouslySetInnerHTML={{ __html: formatDescription(truncatedDesc) }} />

              {problem.tags && (
                <div className={styles.tagsContainer}>
                  {problem.tags.slice(0, 5).map((tag) => <span key={tag} className={styles.tag}>{tag}</span>)}
                </div>
              )}

              <div className={styles.actionButtons}>
                <a href={`/questions/${problem.id}`} className={styles.primaryButton}>Solve Challenge</a>
                {problem.problemUrl && (
                  <a href={problem.problemUrl} target="_blank" rel="noopener noreferrer" className={styles.secondaryButton}>
                    View on Codeforces
                  </a>
                )}
              </div>
            </div>

            {/* Verification Card */}
            {auth.currentUser && (
              <div className={styles.verificationCard}>
                <div className={styles.userStatsRow}>
                   <div className={styles.userStat}>
                     <span style={{fontSize:'2rem'}}>💰</span>
                     <div><div className={styles.statValue}>{userData.coins}</div><div className={styles.statLabel}>Coins</div></div>
                   </div>
                   <div className={styles.userStat}>
                     <span style={{fontSize:'2rem'}}>🔥</span>
                     <div><div className={styles.statValue}>{userData.streak}</div><div className={styles.statLabel}>Day Streak</div></div>
                   </div>
                </div>
                {userSolved ? (
                  <div style={{background:'#f0fdf4', color:'#166534', padding:'1rem', borderRadius:'8px', display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:'600'}}>
                    <FiCheck /> Solved!
                  </div>
                ) : (
                  <button onClick={handleCheckCFSubmission} disabled={isCheckingCF} className={styles.verifyButton}>
                    {isCheckingCF ? "Verifying..." : "Verify Codeforces Submission"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
            <div className={styles.leaderboardCard}>
              <div className={styles.leaderboardHeader}>
                <h3 className={styles.leaderboardTitle}><FiAward className={styles.awardIcon} /> Top Solvers</h3>
                <span style={{background:'#f1f5f9', padding:'2px 8px', borderRadius:'12px', fontSize:'0.8rem', fontWeight:'600'}}>{dailySolvers.length}</span>
              </div>
              <div className={styles.solversListContainer}>
                {dailySolvers.length > 0 ? (
                   <ul style={{listStyle:'none', padding:0, display:'flex', flexDirection:'column', gap:'0.5rem'}}>
                     {dailySolvers.map((s, i) => (
                       <li key={s.uid} style={{padding:'0.5rem', background:'#f8fafc', borderRadius:'8px', display:'flex', justifyContent:'space-between', fontSize:'0.9rem'}}>
                         <span>#{i+1} <b>{s.username}</b></span>
                         <span style={{color:'#94a3b8', fontSize:'0.8rem'}}>{new Date(s.solvedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                       </li>
                     ))}
                   </ul>
                ) : (
                  <div style={{textAlign:'center', padding:'2rem', color:'#94a3b8'}}>
                    <Image src="/images/nosolver.png" alt="Empty" width={400} height={40
                      } style={{marginBottom:'1rem', objectFit:'contain'}} />
                    <p style={{margin:0}}>No one has solved it yet.<br/>Be the first!</p>
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