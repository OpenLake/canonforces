import React, { useState } from 'react';
import styles from './Output.module.css'; // <-- CORRECTED IMPORT

// Define types for props
type TestCase = {
  input: string;
  output: string;
};

type SubmissionResult = {
  status: string;
  message: string;
  results?: Array<{
    status: string;
    // ... other properties
  }>;
} | null;

type Props = {
  output: string | null;
  testCases?: TestCase[]; // Made optional, but defaulted in destructuring
  isRunning: boolean;
  submissionResult: SubmissionResult;
  // These props are passed from CodeEditor but not used here,
  // but we must accept them to prevent TS errors.
  id: string;
  language: string;
  value: string;
  problemData?: any;
  onRun?: () => void;
  onSubmit?: () => void;
  onVerify?: () => void;
  isVerifying?: boolean;
};

const Output: React.FC<Props> = ({
  output,
  testCases = [], // Defaulting here
  isRunning,
  submissionResult,
  onRun,
  onSubmit,
  onVerify,
  isVerifying,
  problemData,
}) => {
  const [activeTab, setActiveTab] = useState('output'); // 'output' or 'testcases'

  const renderContent = () => {
    if (isRunning) {
      return <pre className={styles.outputContent}>Running your code...</pre>;
    }

    if (activeTab === 'output') {
      // This tab should ONLY show the stdout from a "Run" action.
      return (
        <pre className={styles.outputContent}>
          {output ||
            'Run your code to see the output here.'}
        </pre>
      );
    }

    if (activeTab === 'testcases') {
      // This tab should show submission results IF they exist.
      // If not, show the sample test cases.

      if (submissionResult) {
        // --- We have a submission result ---
        const statusClass =
          submissionResult.status === 'Accepted'
            ? styles.statusAccepted
            : styles.statusError;

        // Check if 'results' is an array (for multi-test-case submissions)
        if (submissionResult.results && Array.isArray(submissionResult.results)) {
          return (
            <div className={`${styles.outputContent} ${styles.testcasesGrid}`}>
              <div style={{ gridColumn: '1 / -1', marginBottom: '10px' }}>
                <strong>
                  Overall Status:{' '}
                  <span className={statusClass}>{submissionResult.status}</span>
                </strong>
              </div>
              {submissionResult.results.map((result: any, index: number) => (
                <div key={index} className={styles.testcaseItem}>
                  <strong>Test Case {index + 1}: </strong>
                  <span
                    className={
                      result.status === 'Accepted'
                        ? styles.statusAccepted
                        : styles.statusError
                    }
                  >
                    {result.status}
                  </span>
                </div>
              ))}
            </div>
          );
        }

        // --- It's a simple submission result (e.g., compile error) ---
        return (
          <div className={styles.outputContent}>
            <strong>
              Status:{' '}
              <span className={statusClass}>{submissionResult.status}</span>
            </strong>
            <pre>{submissionResult.message}</pre>
          </div>
        );
      }

      // --- No submission result, show sample test cases ---
      if (!testCases || testCases.length === 0) {
        return (
          <pre className={styles.outputContent}>
            No sample test cases provided.
          </pre>
        );
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
          className={`${styles.terminalTab} ${activeTab === 'output' ? styles.active : ''
            }`}
          onClick={() => setActiveTab('output')}
        >
          Output
        </button>
        <button
          className={`${styles.terminalTab} ${activeTab === 'testcases' ? styles.active : ''
            }`}
          onClick={() => setActiveTab('testcases')}
        >
          Test Cases
        </button>
        <div className={styles.headerActions}>
          <button
            className={styles.runButton}
            onClick={onRun}
            disabled={isRunning}
          >
            {isRunning ? 'Running...' : 'Run'}
          </button>
          <button
            className={styles.submitButton}
            onClick={onSubmit}
            disabled={isRunning || isVerifying}
          >
            Submit
          </button>
          {problemData?.problemUrl && onVerify && (
            <button
              className={styles.submitButton}
              onClick={onVerify}
              disabled={isRunning || isVerifying}
              style={{ backgroundColor: '#10b981', marginLeft: '8px' }}
            >
              {isVerifying ? 'Verifying...' : 'Verify on CF'}
            </button>
          )}
        </div>
      </div>
      <div className={styles.terminalBody}>{renderContent()}</div>
    </div>
  );
};

export default Output;
