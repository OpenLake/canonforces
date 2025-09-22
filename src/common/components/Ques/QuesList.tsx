import React, { useEffect, useState, useCallback } from 'react';
import styles from './QuesList.module.css';
import { useRouter } from 'next/router';
import { db } from '../../../lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

type Problem = {
  id: string;
  title: string;
  description: string;
  input_format: string;
  output_format: string;
  test_case: string;
  answer: string;
  solved: boolean;
  rating: number;
};

type QuesListProps = {
  rating: string;
};

const QuesList: React.FC<QuesListProps> = ({ rating }) => {
  const [questions, setQuestions] = useState<Problem[]>([]);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [overallCompleted, setOverallCompleted] = useState(0);
  const router = useRouter();

  const currentRatingQuestions = questions.length;
  const currentRatingCompleted = checkedIds.size;
  const currentRatingPercentage =
    currentRatingQuestions === 0
      ? 0
      : Math.round((currentRatingCompleted / currentRatingQuestions) * 100);
  const overallPercentage =
    totalQuestions === 0
      ? 0
      : Math.round((overallCompleted / totalQuestions) * 100);

  // Get logged-in user via Firebase Auth
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch total questions count and overall progress
  const fetchOverallStats = useCallback(async () => {
    try {
      const allQuestionsQuery = query(collection(db, 'problems'));
      const allQuestionsSnapshot = await getDocs(allQuestionsQuery);
      const total = allQuestionsSnapshot.size;
      setTotalQuestions(total);

      if (userId) {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const allSolvedQuestions = userData?.solvedQuestions || {};

          let overallSolved = 0;
          Object.values(allSolvedQuestions).forEach((solvedArray: any) => {
            if (Array.isArray(solvedArray)) {
              overallSolved += solvedArray.length;
            }
          });
          setOverallCompleted(overallSolved);
        }
      }
    } catch (error) {
      console.error('Error fetching overall stats:', error);
    }
  }, [userId]);

  // Fetch Questions and User's Solved Questions
  const fetchQuestions = useCallback(async () => {
    try {
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

      if (userId) {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const solvedQuestions: string[] =
            userData?.solvedQuestions?.[rating] || [];
          setCheckedIds(new Set(solvedQuestions));
        }
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  }, [rating, userId]);

  useEffect(() => {
    if (userId) {
      fetchQuestions();
      fetchOverallStats();
    }
  }, [rating, userId, fetchQuestions, fetchOverallStats]);

  // Update User's Solved Questions in Firestore
  const updateUserSolvedQuestions = async (newCheckedIds: Set<string>) => {
    if (!userId) return;

    const userRef = doc(db, 'users', userId);
    try {
      const userSnap = await getDoc(userRef);

      const solvedQuestionsUpdate = {
        ...(userSnap.exists() ? userSnap.data().solvedQuestions : {}),
        [rating]: Array.from(newCheckedIds),
      };

      if (userSnap.exists()) {
        await updateDoc(userRef, {
          solvedQuestions: solvedQuestionsUpdate,
        });
      } else {
        await setDoc(userRef, {
          solvedQuestions: solvedQuestionsUpdate,
        });
      }

      // Update overall progress
      fetchOverallStats();
    } catch (error) {
      console.error('Error updating solved questions:', error);
    }
  };

  const toggleCheckbox = (id: string) => {
    setCheckedIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);

      updateUserSolvedQuestions(newSet);
      return newSet;
    });
  };

  // Circular Progress Component
  const CircularProgress = ({
    percentage,
    size = 80,
    strokeWidth = 8,
    label,
    count,
    total,
  }: {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    label: string;
    count: number;
    total: number;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className={styles.circularProgressContainer}>
        <div className={styles.circularProgressWrapper}>
          <svg className={styles.circularProgressSvg} width={size} height={size}>
            <circle
              className={styles.circularProgressBackground}
              stroke="#e2e8f0"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
            <circle
              className={styles.circularProgressForeground}
              stroke="#3b82f6"
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
          </svg>
          <div className={styles.circularProgressText}>
            <span className={styles.circularProgressPercentage}>
              {percentage}%
            </span>
          </div>
        </div>
        <div className={styles.circularProgressInfo}>
          <h3 className={styles.circularProgressLabel}>{label}</h3>
          <p className={styles.circularProgressCount}>
            <span className={styles.countNumber}>{count}</span>
            <span className={styles.countDivider}>/</span>
            <span className={styles.countTotal}>{total}</span>
          </p>
          <p className={styles.circularProgressSubtext}>Problems Solved</p>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* Progress Dashboard */}
      <div className={styles.progressDashboard}>
        <div className={styles.progressCard}>
          <CircularProgress
            percentage={currentRatingPercentage}
            label={`Rating ${rating} Progress`}
            count={currentRatingCompleted}
            total={currentRatingQuestions}
            size={90}
            strokeWidth={10}
          />
        </div>
        <div className={styles.progressCard}>
          <CircularProgress
            percentage={overallPercentage}
            label="Overall Progress"
            count={overallCompleted}
            total={totalQuestions}
            size={90}
            strokeWidth={10}
          />
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>📚</div>
          <h3 className={styles.emptyStateTitle}>No Questions Found</h3>
          <p className={styles.emptyStateText}>
            No questions available for rating {rating} at the moment.
          </p>
        </div>
      ) : (
        <div className={styles.questionsSection}>
          <div className={styles.questionsSectionHeader}>
            <h2 className={styles.questionsSectionTitle}>
              Rating {rating} Problems
            </h2>
            <span className={styles.questionsCount}>
              {questions.length}{' '}
              {questions.length === 1 ? 'problem' : 'problems'}
            </span>
          </div>
          <ul className={styles.questionsList}>
            {questions.map((q, index) => (
              <li key={q.id} className={styles.questionItem}>
                <div className={styles.questionItemContent}>
                  <div className={styles.questionNumber}>{index + 1}</div>
                  <div className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={checkedIds.has(q.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleCheckbox(q.id);
                      }}
                      id={`checkbox-${q.id}`}
                    />
                    <label
                      htmlFor={`checkbox-${q.id}`}
                      className={styles.checkboxLabel}
                    ></label>
                  </div>
                  <button
                    onClick={() => router.push(`/questions/${q.id}`)}
                    className={`${styles.questionButton} ${
                      checkedIds.has(q.id)
                        ? styles.questionButtonSolved
                        : ''
                    }`}
                  >
                    <span className={styles.questionTitle}>{q.title}</span>
                    <div className={styles.questionMeta}>
                      {checkedIds.has(q.id) && (
                        <span className={styles.solvedBadge}>✓ Solved</span>
                      )}
                    </div>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default QuesList;
