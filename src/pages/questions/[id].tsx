import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../../styles/CodeEditor.module.css';
import CodeEditor from '../../common/components/CodeEditor/CodeEditor';
import { db } from '../../lib/firebase';

const QuestionBar = () => {
  const router = useRouter();
  const { id } = router.query;

  const [ques, setQues] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (typeof id === 'string') {
        try {
          const docRef = doc(db, 'problems', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setQues(docSnap.data());
          } else {
            console.warn('No such question found!');
          }
        } catch (error) {
          console.error('Error fetching question:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchQuestion();
  }, [id]);

  return (
    <div className={styles.container}>
      <div className={styles.leftPane}>
        {loading ? (
          <p className={styles.loading}>Loading question...</p>
        ) : ques ? (
          <>
            <h2 className={styles.title}>{ques.title}</h2>
            <p className={styles.section}>
              <span className={styles.label}>Description:</span>
              <br />
              {ques.description}
            </p>
            <p className={styles.section}>
              <span className={styles.label}>Input Format:</span>
              <pre className={styles.code}>{ques.input_format}</pre>
            </p>
            <p className={styles.section}>
              <span className={styles.label}>Output Format:</span>
              <pre className={styles.code}>{ques.output_format}</pre>
            </p>
            <p className={styles.section}>
              <span className={styles.label}>Sample Input:</span>
              <pre className={styles.code}>{ques.test_case}</pre>
            </p>
            <p className={styles.section}>
              <span className={styles.label}>Sample Output:</span>
              <pre className={styles.code}>{ques.answer}</pre>
            </p>
          </>
        ) : (
          <p className={styles.loading}>Question not found</p>
        )}
      </div>

      <div className={styles.rightPane}>
        <div className={styles.editorPlaceholder}>
          <CodeEditor id={typeof id === 'string' ? id : ''} />
        </div>
      </div>
    </div>
  );
};

export default QuestionBar;
