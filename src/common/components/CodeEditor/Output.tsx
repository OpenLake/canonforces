import React, { useState } from 'react';
import styles from './Output.module.css'; // <-- CORRECTED IMPORT

/**
 * This component renders the "IDE Terminal" style output.
 * It assumes it receives props like:
 * - output: The stdout from a code execution.
 * - testCases: An array of sample test cases.
 * - isRunning: A boolean to show a loading/running state.
 * - submissionResult: The result from a full submission.
 *
 * You may need to adapt the prop names to what your parent
 * component (like Problem.js) is passing down.
 */
const Output = ({ output, testCases = [], isRunning, submissionResult }) => {
  const [activeTab, setActiveTab] = useState('output'); // 'output' or 'testcases'

  const renderContent = () => {
    if (isRunning) {
      return <pre className={styles.outputContent}>Running your code...</pre>;
    }

    if (activeTab === 'output') {
      // Show submission result if it exists, otherwise show run output
      const content = submissionResult ? submissionResult.message : output;
      
      let statusClass = '';
      if (submissionResult) {
        statusClass = submissionResult.status === 'Accepted' ? styles.statusAccepted : styles.statusError;
      }

      return (
        <pre className={`${styles.outputContent} ${statusClass}`}>
          {content || 'Run your code to see the output here.'}
        </pre>
      );
    }

    if (activeTab === 'testcases') {
      // This is a placeholder. You should map over your actual testCases prop.
      if (testCases.length === 0) {
        return <pre className={styles.outputContent}>No sample test cases provided.</pre>;
      }
      return (
        <div className={`${styles.outputContent} ${styles.testcasesGrid}`}>
          {testCases.map((tc, index) => (
            <div key={index} className={styles.testcaseItem}>
              <strong>Test Case {index + 1}</strong>
              <div className={styles.testcaseIo}>
                <label>Input:</label>
                <pre>{tc.input}</pre>
              </div>
              <div className={styles.testcaseIo}>
                <label>Output:</label>
                <pre>{tc.output}</pre>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.ideTerminal}>
      <div className={styles.terminalHeader}>
        <button
          className={`${styles.terminalTab} ${activeTab === 'output' ? styles.active : ''}`}
          onClick={() => setActiveTab('output')}
        >
          Output
        </button>
        <button
          className={`${styles.terminalTab} ${activeTab === 'testcases' ? styles.active : ''}`}
          onClick={() => setActiveTab('testcases')}
        >
          Test Cases
        </button>
      </div>
      <div className={styles.terminalBody}>
        {renderContent()}
      </div>
    </div>
  );
};

export default Output;