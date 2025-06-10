import React, { useState } from 'react';
import styles from './QuesList.module.css';
import {useRouter} from 'next/router'
import { ratingToQuesMap } from '../../../constants/Twomaps';

type QuesListProps = {
  rating: string;
};

const QuesList: React.FC<QuesListProps> = ({ rating }) => {
  const questions = ratingToQuesMap[rating] || [];
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
    const router = useRouter();
  const toggleCheckbox = (id: string) => {
    setCheckedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className={styles.container}>
      {questions.length === 0 ? (
        <p className={styles.noQuestions}>No questions found for rating {rating}</p>
      ) : (
        <ul className={styles.list}>
          {questions.map((q) => (
            <li key={q.id} className={styles.listItem}>
              <button onClick={() => router.push(`/questions/${q.id}`)} className={styles.questionButton}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={checkedIds.has(q.id)}
                  onChange={() => toggleCheckbox(q.id)}
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
