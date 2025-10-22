import React, { useEffect, useState } from "react";
import { getPOTD } from "../services/potd_fetch";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import styles from "../styles/POTDpage.module.css";
import Image from "next/image";
import { formatDescription } from "../utils/formatDescription";

// --- Types ---
interface Solver {
  uid: string;
  username: string;
  solvedAt: string | Date;
}

interface Problem {
  id: string;
  title: string;
  description?: string;
  input_format?: string;
  output_format?: string;
  answer?: string;
  test_case?: string;
  rating?: number;
  tags?: string[];
}

const FiCpu = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className={styles.cpuIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
    <rect x="9" y="9" width="6" height="6"></rect>
    <line x1="9" y1="1" x2="9" y2="4"></line>
    <line x1="15" y1="1" x2="15" y2="4"></line>
    <line x1="9" y1="20" x2="9" y2="23"></line>
    <line x1="15" y1="20" x2="15" y2="23"></line>
    <line x1="20" y1="9" x2="23" y2="9"></line>
    <line x1="20" y1="14" x2="23" y2="14"></line>
    <line x1="1" y1="9" x2="4" y2="9"></line>
    <line x1="1" y1="14" x2="4" y2="14"></line>
  </svg>
);

const FiCode = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className={styles.codeIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
);

const FiAward = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className={styles.awardIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="8" r="7"></circle>
    <polyline points="8.21 13.89 7 23 12 17 17 23 15.79 13.88"></polyline>
  </svg>
);

const POTDPage: React.FC = () => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailySolvers, setDailySolvers] = useState<Solver[]>([]);
  const [userSolved, setUserSolved] = useState(false);

  const todayDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Fetch POTD
  useEffect(() => {
    async function fetchPOTD() {
      try {
        const id = await getPOTD();
        if (!id || typeof id !== "string") throw new Error("Invalid POTD ID");

        const ref = doc(db, "problems", id);
        const snapshot = await getDoc(ref);
        if (!snapshot.exists()) throw new Error("Problem not found");

        setProblem({ id, ...(snapshot.data() as Omit<Problem, "id">) });
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
    const submissionRef = doc(db, "potd_submissions", todayDate);

    const unsubscribe = onSnapshot(submissionRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data?.problemId !== problem?.id) return; // Only show solvers for current POTD

        const solversData = data?.solvers || {};
        const solversArray: Solver[] = Object.entries(solversData).map(([uid, value]: [string, any]) => ({
          uid,
          username: value.username,
          solvedAt: value.solvedAt,
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

  const handleMarkSolved = async () => {
    if (!auth.currentUser || !problem) return;

    const submissionRef = doc(db, "potd_submissions", todayDate);

    await setDoc(
      submissionRef,
      {
        problemId: problem.id,
        solvers: {
          [auth.currentUser.uid]: {
            uid: auth.currentUser.uid,
            username: auth.currentUser.displayName || auth.currentUser.email?.split("@")[0],
            solvedAt: new Date(),
          },
        },
      },
      { merge: true }
    );

    setUserSolved(true);
  };

  const getDifficulty = (rating?: number) => {
    if (!rating) return "Unknown";
    if (rating < 1200) return "Easy";
    if (rating < 1800) return "Medium";
    return "Hard";
  };

  const difficultyColors: Record<string, string> = {
    Easy: styles.easy,
    Medium: styles.medium,
    Hard: styles.hard,
    Unknown: styles.unknown,
  };

  if (loading) return <div className={styles.centerScreen}><p className={styles.loading}>Loading Problem of the Day...</p></div>;
  if (error || !problem) return <div className={styles.centerScreen}><p className={styles.error}>{error || "Problem not found"}</p></div>;

  const difficulty = getDifficulty(problem.rating);

  return (
    <div className={styles.pageWrapper}>
      <Image src="/images/think.png" alt="Mascot thinking" width={400} height={400} className={styles.mascot} />
      <div className={styles.container}>
        <div className={styles.header}>
          <FiCpu />
          <h1 className={styles.title}>Problem of the Day</h1>
          <p className={styles.date}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardContent}>
            <div className={styles.problemHeader}>
              <h2 className={styles.problemTitle}>{problem.title}</h2>
              <span className={`${styles.difficulty} ${difficultyColors[difficulty]}`}>{difficulty}</span>
            </div>

            {problem.description && <p className={styles.description}>{formatDescription(problem.description)}</p>}

            {problem.tags && problem.tags.length > 0 && (
              <div className={styles.tagsWrapper}>
                <FiCode />
                <div className={styles.tags}>
                  {problem.tags.map((tag) => <span key={tag} className={styles.tag}>{tag}</span>)}
                </div>
              </div>
            )}

            <div className={styles.solveButtonWrapper}>
              <a href={`/questions/${problem.id}`} className={styles.solveButton}>Solve Today&apos;s Problem</a>
            </div>

            {/* Checkbox for testing */}
            {auth.currentUser && (
              <div className="mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={userSolved}
                    onChange={handleMarkSolved}
                  />
                  I have solved this problem
                </label>
              </div>
            )}
          </div>

          {dailySolvers.length > 0 && (
            <div className={styles.solverSection}>
              <h3 className={styles.solverHeading}><FiAward /> First Solvers Today</h3>
              <ul className={styles.solverList}>
                {dailySolvers.map((solver, i) => (
                  <li key={solver.uid} className={styles.solverItem}>
                    🏅 {i + 1}. {solver.username}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default POTDPage;
