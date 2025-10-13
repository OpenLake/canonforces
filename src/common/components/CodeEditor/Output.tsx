import React, { useEffect, useState } from 'react';
import { executeCode } from '../../../pages/api/hello';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../../../styles/Output.module.css';
import { db } from '../../../lib/firebase';

interface OutputProps {
  id: string;
  language: string;
  value: string;
  problemData?: any;
}

const Output: React.FC<OutputProps> = ({ id, language, value, problemData }) => {
  const [question, setQuestion] = useState<any>(problemData || null);
  const [output, setOutput] = useState<
    { output: any; error: any; compile_output: any; status: any }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [activeTab, setActiveTab] = useState<'output' | 'testcases'>('output');

  // Inside src/common/components/CodeEditor/Output.tsx

useEffect(() => {
  if (problemData) {
    setQuestion(problemData);
  } else {
    const fetchQuestion = async () => {
      // --- FIX: Add this guard clause! ---
      // This prevents the function from running if the ID is invalid.
      if (!id || typeof id !== 'string') {
        return;
      }

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
  }
}, [id, problemData]);
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
      setActiveTab('output');
    } catch (error) {
      console.log(error);
      setOutput([{
        output: null,
        error: 'Execution failed',
        compile_output: null,
        status: 'Error'
      }]);
      setIsError(true);
      setActiveTab('output');
    } finally {
      setIsLoading(false);
    }
  };

  const submitCode = async () => {
    if (!value || !question) return;
    
    setIsLoading(true);
    try {
      // This would typically run against multiple test cases
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
      setActiveTab('output');
    } catch (error) {
      console.log(error);
      setOutput([{
        output: null,
        error: 'Submission failed',
        compile_output: null,
        status: 'Error'
      }]);
      setIsError(true);
      setActiveTab('output');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
      case 'Error':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
    }
  };

  return (
    <div className={styles.outputWrapper}>
      {/* Action Buttons */}
      <div className={styles.actionBar}>
        <button
          className={`${styles.button} ${styles.runButton}`}
          onClick={runCode}
          disabled={isLoading || !question}
        >
          {isLoading ? (
            <>
              <div className={styles.spinner}></div>
              Running...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              Run Code
            </>
          )}
        </button>
        
        <button
          className={`${styles.button} ${styles.submitButton}`}
          onClick={submitCode}
          disabled={isLoading || !question}
        >
          {isLoading ? (
            <>
              <div className={styles.spinner}></div>
              Submitting...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              </svg>
              Submit
            </>
          )}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${activeTab === 'output' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('output')}
        >
          Output
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'testcases' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('testcases')}
        >
          Test Cases
        </button>
      </div>

      {/* Content Area */}
      <div className={styles.contentArea}>
        {activeTab === 'output' ? (
          <div className={styles.outputContent}>
            {output.length > 0 ? (
              output.map((res, i) => {
                const userOutput = (res.output || "").trim();
                const expectedOutput = (question?.answer || "").trim();
                const isCorrect = userOutput === expectedOutput;
                const hasError = res.error || res.compile_output;

                return (
                  <div className={styles.resultContainer} key={i}>
                    {/* Status Header */}
                    <div className={`${styles.statusHeader} ${isCorrect ? styles.success : styles.error}`}>
                      <div className={styles.statusIcon}>
                        {getStatusIcon(isCorrect ? 'Accepted' : 'Error')}
                      </div>
                      <span className={styles.statusText}>
                        {isCorrect ? 'Accepted' : hasError ? 'Runtime Error' : 'Wrong Answer'}
                      </span>
                    </div>

                    {/* Error Messages */}
                    {hasError && (
                      <div className={styles.errorSection}>
                        <h4 className={styles.sectionTitle}>Error:</h4>
                        <pre className={styles.errorOutput}>
                          {res.error || res.compile_output}
                        </pre>
                      </div>
                    )}

                    {/* Your Output */}
                    <div className={styles.outputSection}>
                      <h4 className={styles.sectionTitle}>Your Output:</h4>
                      <pre className={`${styles.output} ${isCorrect ? styles.correctOutput : styles.incorrectOutput}`}>
                        {userOutput || 'No output'}
                      </pre>
                    </div>

                    {/* Expected Output (if wrong) */}
                    {!isCorrect && !hasError && (
                      <div className={styles.outputSection}>
                        <h4 className={styles.sectionTitle}>Expected Output:</h4>
                        <pre className={`${styles.output} ${styles.expectedOutput}`}>
                          {expectedOutput}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                </svg>
                <p>Run your code to see the output here</p>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.testCasesContent}>
            <div className={styles.testCase}>
              <h4 className={styles.sectionTitle}>Sample Test Case:</h4>
              <div className={styles.testCaseSection}>
                <h5>Input:</h5>
                <pre className={styles.testInput}>{question?.test_case || 'No test case available'}</pre>
              </div>
              <div className={styles.testCaseSection}>
                <h5>Expected Output:</h5>
                <pre className={styles.testOutput}>{question?.answer || 'No expected output available'}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Output;