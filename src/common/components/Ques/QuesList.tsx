import React, { useEffect, useState } from 'react';
import styles from './QuesList.module.css';
import { useRouter } from 'next/router';
import { db } from '../../../lib/firebase'; // adjust path as needed
import { collection, query, where, getDocs } from 'firebase/firestore';

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
  const router = useRouter();

  const fetchQuestions = async () => {
    try {
      const q = query(
        collection(db, 'problems'),
        where('rating', '==', parseInt(rating))
      );
      const querySnapshot = await getDocs(q);
      const fetchedQuestions: Problem[] = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as Problem),
      }));
      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [rating]);

  const toggleCheckbox = (id: string) => {
    setCheckedIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  return (
    <div className={styles.container}>
      {loading ? (
        <p>Loading...</p>
      ) : questions.length === 0 ? (
        <p className={styles.noQuestions}>No questions found for rating {rating}</p>
      ) : (
        <ul className={styles.list}>
          {questions.map((q) => (
            <li key={q.id} className={styles.listItem}>

              <button
                onClick={() => router.push(`/questions/${q.id}`)}
                className={styles.questionButton}
              >
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={checkedIds.has(q.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleCheckbox(q.id);
                  }}
                />
                {q.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuesList;
