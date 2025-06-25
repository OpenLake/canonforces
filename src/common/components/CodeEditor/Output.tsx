import React, { useEffect, useState } from 'react';
import { executeCode } from '../../../pages/api/hello';
import { doc, getDoc } from 'firebase/firestore';
import styles from './Output.module.css';
import { db } from '../../../lib/firebase';

interface OutputProps {
  id: string;
  language: string;
  value: string;
}

const Output: React.FC<OutputProps> = ({ id, language, value }) => {
  const [question, setQuestion] = useState<any>(null);
  const [output, setOutput] = useState<
    { output: any; error: any; compile_output: any; status: any }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const docRef = doc(db, 'problems', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setQuestion(docSnap.data());
        } else {
          console.warn('No question found with that ID');
        }
      } catch (err) {
        console.error('Error fetching question:', err);
      }
    };

    fetchQuestion();
  }, [id]);

  const runCode = async () => {
    if (!value || !question) return;

    setIsLoading(true);
    try {
      const { run: result } = await executeCode(language, value, question.test_case);
      setOutput([
        {
          output: result.output,
          error: result.stderr,
          compile_output: result.compile_output,
          status: result.status,
        },
      ]);
      setIsError(result.status !== 'Accepted');
    } catch (error) {
      console.log(error);
      alert('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
  <button
    className={styles.button}
    onClick={runCode}
    disabled={isLoading || !question}
  >
    {isLoading ? 'Running...' : 'Run Code'}
  </button>

  <div className={`${styles.outputBox} ${isError ? styles.error : ''}`}>
    {output.length > 0 ? (
      output.map((res, i) => {
        // Compare output with expected answer
        const userOutput = (res.output || "").trim();
        const expectedOutput = (question?.answer || "").trim();
        const isCorrect = userOutput === expectedOutput;

        return (
          <div className={styles.resultBlock} key={i}>
            <p className={styles.label}>Output:</p>
            <p
              className={`${styles.text} ${
                isCorrect ? styles.success : styles.fail
              }`}
            >
              {res.output || res.compile_output || res.error || res.status}
            </p>
            {!isCorrect && (
              <>
                <p className={styles.label}>Expected Output:</p>
                <p className={styles.text + " " + styles.success}>{expectedOutput}</p>
              </>
            )}
          </div>
        );
      })
    ) : (
      <p>Click &quot;Run Code&quot; to see the output here</p>
    )}
  </div>
</div>
  );
};

export default Output;
