import React, { useEffect, useState, useCallback } from 'react';
import styles from './QuesList.module.css';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { db } from '../../../lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// --- Types ---
type Problem = {
  id: string;
  title: string;
  description: string;
  problemUrl: string; 
  rating: number;
};

type QuesListProps = {
  rating: string;
};

// --- Helper: Parse CF URL ---
const parseCfUrl = (url: string) => {
  try {
    const parts = url.split('/');
    // Handles formats like .../problem/1901/A
    const index = parts.pop();
    const contestId = parts.pop();
    if (contestId && index && !isNaN(Number(contestId))) {
      return { contestId: Number(contestId), index: index.toUpperCase() };
    }
    return null;
  } catch (e) {
    return null;
  }
};

const QuesList: React.FC<QuesListProps> = ({ rating }) => {
  const [questions, setQuestions] = useState<Problem[]>([]);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());
  
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false); 
  const [userId, setUserId] = useState<string | null>(null);
  const [cfHandle, setCfHandle] = useState<string | null>(null);

  const [totalQuestions, setTotalQuestions] = useState(0);
  const [overallCompleted, setOverallCompleted] = useState(0);
  const router = useRouter();

  const currentRatingQuestions = questions.length;
  const currentRatingCompleted = solvedIds.size;
  const currentRatingPercentage =
    currentRatingQuestions === 0
      ? 0
      : Math.round((currentRatingCompleted / currentRatingQuestions) * 100);
  const overallPercentage =
    totalQuestions === 0
      ? 0
      : Math.round((overallCompleted / totalQuestions) * 100);

  // 1. Auth & User Data Fetch
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          // Assuming 'username' stores the Codeforces handle
          if (data.username) setCfHandle(data.username);
        }
      } else {
        setUserId(null);
        setCfHandle(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Questions & Progress
  const fetchQuestionsAndProgress = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // Fetch Problems
      const q = query(
        collection(db, 'problems'),
        where('rating', '==', parseInt(rating))
      );
      const querySnapshot = await getDocs(q);
      const fetchedQuestions: Problem[] = querySnapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as Problem),
        id: docSnap.id,
      }));
      setQuestions(fetchedQuestions);

      // Fetch User Solved
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const solvedArr: string[] = userData?.solvedQuestions?.[rating] || [];
        setSolvedIds(new Set(solvedArr));
        
        // Overall Stats
        const allSolvedMap = userData?.solvedQuestions || {};
        let count = 0;
        Object.values(allSolvedMap).forEach((arr: any) => {
            if(Array.isArray(arr)) count += arr.length;
        });
        setOverallCompleted(count);
      }
      
      const allQ = await getDocs(collection(db, 'problems'));
      setTotalQuestions(allQ.size);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [rating, userId]);

  useEffect(() => {
    fetchQuestionsAndProgress();
  }, [fetchQuestionsAndProgress]);


  // 3. Sync with Codeforces API
  const handleSyncWithCodeforces = async () => {
    if (!cfHandle || !userId) {
      alert("Please ensure you are logged in and have a Codeforces handle linked.");
      return;
    }
    
    setSyncing(true);
    try {
      const response = await fetch(`https://codeforces.com/api/user.status?handle=${cfHandle}`);
      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error('Failed to fetch Codeforces data');
      }

      // Create verified set from CF
      const cfSolvedSet = new Set<string>();
      data.result.forEach((submission: any) => {
        if (submission.verdict === 'OK') {
          const key = `${submission.problem.contestId}-${submission.problem.index}`;
          cfSolvedSet.add(key);
        }
      });

      // Match against local questions
      const newSolvedIds = new Set(solvedIds);
      let hasUpdates = false;

      questions.forEach((q) => {
        if (!q.problemUrl) return;
        
        const parsed = parseCfUrl(q.problemUrl);
        if (parsed) {
          const key = `${parsed.contestId}-${parsed.index}`;
          // If solved on CF but not marked locally
          if (cfSolvedSet.has(key) && !solvedIds.has(q.id)) {
            newSolvedIds.add(q.id);
            hasUpdates = true;
          }
        }
      });

      // Update Firestore
      if (hasUpdates) {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        const currentSolvedMap = userSnap.exists() ? userSnap.data().solvedQuestions : {};
        
        await updateDoc(userRef, {
          solvedQuestions: {
            ...currentSolvedMap,
            [rating]: Array.from(newSolvedIds)
          },
          lastSolvedDate: new Date().toISOString().split('T')[0] 
        });

        setSolvedIds(newSolvedIds);
        setOverallCompleted(prev => prev + (newSolvedIds.size - solvedIds.size));
      }

    } catch (error) {
      console.error("Sync failed:", error);
      alert("Could not sync with Codeforces. Please check your internet or try again later.");
    } finally {
      setSyncing(false);
    }
  };


  // --- Circular Progress Component ---
  const CircularProgress = ({ percentage, label, count, total }: any) => {
    const radius = 36;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className={styles.circularProgressContainer}>
        <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
          <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="40" cy="40" r={radius} stroke="#e2e8f0" strokeWidth="8" fill="none" />
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#3b82f6"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#1e293b' }}>
            {percentage}%
          </div>
        </div>
        <div>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', color: '#64748b' }}>{label}</h3>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>
            <span style={{ color: '#3b82f6' }}>{count}</span>
            <span style={{ color: '#cbd5e1', margin: '0 4px' }}>/</span>
            {total}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      
      {/* 1. Progress Dashboard */}
      <div className={styles.progressDashboard}>
        <div className={styles.progressCard}>
          <CircularProgress
            percentage={currentRatingPercentage}
            label={`Rating ${rating}`}
            count={currentRatingCompleted}
            total={currentRatingQuestions}
          />
        </div>
        <div className={styles.progressCard}>
          <CircularProgress
            percentage={overallPercentage}
            label="Total Solved"
            count={overallCompleted}
            total={totalQuestions}
          />
        </div>
      </div>

      {/* 2. Action Bar: Sync Button */}
      <div className={styles.actionBar}>
        <button 
          className={styles.syncButton} 
          onClick={handleSyncWithCodeforces}
          disabled={syncing || loading}
        >
          {syncing ? (
             <>
               <span className={styles.spin}>↻</span> Syncing...
             </>
          ) : (
             <>
               <span>↻</span> Sync Progress
             </>
          )}
        </button>
      </div>

      {/* 3. Questions List */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading your arena...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No Questions Found</h3>
          <p>There are no active problems for rating {rating} yet.</p>
        </div>
      ) : (
        <div className={styles.questionsSection}>
          <div className={styles.questionsSectionHeader}>
            <h2 className={styles.questionsSectionTitle}>Rating {rating} Challenges</h2>
            <span className={styles.questionsCount}>{questions.length} Problems</span>
          </div>
          
          <ul className={styles.questionsList}>
            {questions.map((q, index) => {
              const isSolved = solvedIds.has(q.id);
              
              return (
                <li 
                    key={q.id} 
                    className={styles.questionItem}
                    onClick={() => router.push(`/questions/${q.id}`)}
                >
                  
                  {/* Left: Info */}
                  <div className={styles.questionInfo}>
                    <div className={styles.questionNumber}>{index + 1}</div>
                    <div className={styles.questionContent}>
                      <div className={styles.questionTitle}>{q.title}</div>
                      <div className={styles.questionTags}>
                        <span className={styles.tag}>Rating {rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className={styles.questionActions}>
                    {/* Status Badge */}
                    <div className={`${styles.statusBadge} ${isSolved ? styles.solved : styles.unsolved}`}>
                      {isSolved ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          Solved
                        </>
                      ) : (
                        "Unsolved"
                      )}
                    </div>

                    {/* CF Link Button */}
                    {q.problemUrl && (
                      <div 
                        className={styles.cfButton}
                        title="View on Codeforces"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent redirecting to local editor
                            window.open(q.problemUrl, '_blank');
                        }}
                      >
                         <img 
                           src="/logos/codeforces.png" 
                           alt="CF" 
                           className={styles.cfIcon}
                         />
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default QuesList;