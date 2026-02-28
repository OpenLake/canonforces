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
  aiHints?: [string, string, string] | null;
  hintLevel?: number;
  isFetchingHint?: boolean;
  onGetHint?: () => void;
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
  aiHints,
  hintLevel = 0,
  isFetchingHint,
  onGetHint,
}) => {
  const [activeTab, setActiveTab] = useState('output'); // 'output', 'testcases', or 'hints'

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

    if (activeTab === 'hints') {
      return (
        <div className={styles.outputContent} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#fcd34d' }}>🤖 AI Assistance</h3>

            {hintLevel < 3 && (
              <button
                className={styles.aiHintButton}
                onClick={onGetHint}
                disabled={isFetchingHint}
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                {isFetchingHint ? 'Thinking...' : "Reveal Hint " + (hintLevel + 1) + " (10 Coins) ✨"}
              </button>
            )}
          </div>

          <p style={{ color: '#9ca3af', fontSize: '0.9em' }}>Hints reveal progressively: Top (1), Error Approach (2), Solution (3).</p>

          {hintLevel === 0 && !isFetchingHint && (
            <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed #4b5563', borderRadius: '8px', color: '#9ca3af' }}>
              Click the button above to spend 10 coins and get your first AI hint!
            </div>
          )}

          {isFetchingHint && hintLevel === 0 && (
            <div className={styles.skeletonHint} style={{ padding: '20px', textAlign: 'center', borderRadius: '8px', background: '#374151', animation: 'pulse 1.5s infinite' }}>
              Analyzing your code...
            </div>
          )}

          {aiHints && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {hintLevel >= 1 && (
                <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '16px', borderRadius: '8px' }}>
                  <h4 style={{ color: '#38bdf8', marginTop: 0 }}>Hint 1: Topic</h4>
                  <div style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{aiHints[0]}</div>
                </div>
              )}
              {hintLevel >= 2 && (
                <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '16px', borderRadius: '8px' }}>
                  <h4 style={{ color: '#f472b6', marginTop: 0 }}>Hint 2: Error Approach</h4>
                  <div style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{aiHints[1]}</div>
                </div>
              )}
              {hintLevel >= 3 && (
                <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '16px', borderRadius: '8px' }}>
                  <h4 style={{ color: '#4ade80', marginTop: 0 }}>Hint 3: Full Solution</h4>
                  <div style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{aiHints[2]}</div>
                </div>
              )}
            </div>
          )}
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
        <button
          className={`${styles.terminalTab} ${activeTab === 'hints' ? styles.active : ''
            }`}
          onClick={() => setActiveTab('hints')}
          style={{ color: activeTab === 'hints' ? '#fcd34d' : '#9ca3af' }}
        >
          AI Hints ✨
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
