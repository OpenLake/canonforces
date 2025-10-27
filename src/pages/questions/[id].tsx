import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../../styles/CodeEditor.module.css';
import CodeEditor from '../../common/components/CodeEditor/CodeEditor';
import { db } from '../../lib/firebase';
import { formatDescription } from '../../utils/formatDescription';
// Import the code snippets AND language versions
import {
  CODE_SNIPPETS,
  LANGUAGE_VERSIONS,
} from '../../constants/boilerplate';

// Helper function to parse test cases (simplified)
const parseTestCases = (inputs: string, outputs: string) => {
  if (!inputs || !outputs) {
    return [];
  }
  return [
    {
      input: inputs,
      output: outputs,
    },
  ];
};

// --- Define the shape of the API response ---
type RunResult = {
  output: string;
  stderr: string;
  compile_output: string;
  status: string;
  time: string;
  memory: number;
};

const QuestionBar = () => {
  const router = useRouter();
  const { id } = router.query;

  type Problem = {
    title: string;
    description: string;
    difficulty?: string;
    input_format?: string;
    output_format?: string;
    test_case?: string;
    answer?: string; // This is optional
    constraints?: string;
  };

  const [ques, setQues] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);

  // --- NEW STATE FOR THE EDITOR ---
  const [language, setLanguage] = useState<string>('python');
  const [codeValue, setCodeValue] = useState(
    CODE_SNIPPETS[language as keyof typeof CODE_SNIPPETS]
  );
  const [testCases, setTestCases] = useState<any[]>([]);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);
  // ---------------------------------

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!id || typeof id !== 'string') return;
      try {
        const docRef = doc(db, 'problems', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const problemData = docSnap.data() as Problem;
          setQues(problemData);
          setTestCases(
            parseTestCases(problemData.test_case || "", problemData.answer || "")
          );
        } else {
          console.warn('No such question found!');
        }
      } catch (error) {
        console.error('Error fetching question:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [id]);

  const toggleLeftPanel = () => {
    setLeftPanelCollapsed(!leftPanelCollapsed);
  };

  // --- NEW HANDLERS ---
  const onLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCodeValue(CODE_SNIPPETS[newLang as keyof typeof CODE_SNIPPETS]);
    setOutput(null); // Clear output on lang change
    setSubmissionResult(null); // Clear submission result on lang change
  };

  const onCodeChange = (value: string | undefined) => {
    setCodeValue(value || '');
  };

  // --- THIS IS NOW A REAL API CALL ---
  const runSampleTest = async () => {
    if (!testCases.length) {
      setOutput('No sample test case available to run.');
      return;
    }

    console.log('Running code against API...');
    setIsRunning(true);
    setOutput('Running your code...');
    setSubmissionResult(null);

    const sampleInput = testCases[0]?.input || "";
    const expectedOutput = ques?.answer || "";

    let finalOutput = ""; // This will hold stdout or error
    let status = "Error"; // Default status
    let resultMessage = ""; // This goes below the stdout

    try {
      const response = await fetch('/api/hello', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          codeValue,
          input: sampleInput,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data: { run: RunResult } = await response.json();
      const runResult = data.run;

      // 1. Check for compile or runtime errors
      if (runResult.stderr) {
        finalOutput = runResult.stderr;
        status = "Runtime Error";
        resultMessage = `\n\nResult: ❌ ${status}`;
      } else if (runResult.compile_output) {
        finalOutput = runResult.compile_output;
        status = "Compilation Error";
        resultMessage = `\n\nResult: ❌ ${status}`;
      } else {
        // 2. No errors, check for correctness
        finalOutput = runResult.output;
        const actualOutput = finalOutput.trim();

        if (actualOutput === expectedOutput.trim()) {
          status = "Accepted";
          resultMessage = `\n\nResult: ✅ ${status}`;
        } else {
          status = "Wrong Answer";
          resultMessage = `\n\nResult: ❌ ${status} \n\nExpected:\n${expectedOutput}\n\nGot:\n${actualOutput}`;
        }
      }

    } catch (error: any) {
      console.error('Fetch error:', error);
      finalOutput = `Failed to connect to execution service.\n${error.message}`;
      status = "Network Error";
      resultMessage = `\n\nResult: ❌ ${status}`;
    } finally {
      setIsRunning(false);
      // Set output for the "OUTPUT" tab
      setOutput(finalOutput + resultMessage);
      
      // Set submissionResult for the "TEST CASES" tab
      setSubmissionResult({
        status: status,
        message: status,
        results: [{ status: status }], // Show status for 1 test case
      });
    }
  };

  const handleRunCode = () => {
    runSampleTest();
  };

  const handleSubmitCode = () => {
    // For now, submit also just runs the sample test.
    // You can change this later to run against hidden cases.
    runSampleTest();
  };
  // ---------------------

  return (
    <div className={styles.container}>
      {/* Left Panel - Problem Description */}
      <div
        className={`${styles.leftPane} ${
          leftPanelCollapsed ? styles.collapsed : ''
        }`}
      >
        {/* --- ADDED: BACK NAVIGATION BUTTON --- */}
        <div
          style={{
            padding: '10px 15px',
            borderBottom: '1px solid #333',
            display: leftPanelCollapsed ? 'none' : 'block',
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              color: '#9e9e9e',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ marginRight: '8px' }}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to Problems
          </button>
        </div>

        {/* ... (rest of the problem description JSX is unchanged) ... */}
        {!leftPanelCollapsed && (
          <div className={styles.problemContent}>
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p className={styles.loading}>Loading problem...</p>
              </div>
            ) : ques ? (
              <>
                <div className={styles.problemHeader}>
                  <h1 className={styles.title}>{ques.title}</h1>
                  <div className={styles.difficulty}>
                    <span
                      className={`${styles.difficultyBadge} ${
                        styles[ques.difficulty?.toLowerCase() || 'medium']
                      }`}
                    >
                      {ques.difficulty || 'Medium'}
                    </span>
                  </div>
                </div>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Description</h3>
                  <div className={styles.description}>
                    {formatDescription(ques.description)}
                  </div>
                </div>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Input Format</h3>
                  <pre className={styles.codeBlock}>
                    {formatDescription(ques.input_format || '')}
                  </pre>
                </div>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Output Format</h3>
                  <pre className={styles.codeBlock}>
                    {formatDescription(ques.output_format || '')}
                  </pre>
                </div>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Sample Input</h3>
                  <pre className={`${styles.codeBlock} ${styles.sampleInput}`}>
                    {ques.test_case}
                  </pre>
                </div>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Sample Output</h3>
                  <pre
                    className={`${styles.codeBlock} ${styles.sampleOutput}`}
                  >
                    {ques.answer}
                  </pre>
                </div>
                {ques.constraints && (
                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Constraints</h3>
                    <div className={styles.constraints}>
                      {ques.constraints}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.errorContainer}>
                <p className={styles.error}>Problem not found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Panel - Code Editor */}
      <div
        className={`${styles.rightPane} ${
          leftPanelCollapsed ? styles.expanded : ''
        }`}
      >
        <div className={styles.editorHeader}>
          {/* --- "ABOVE" LANGUAGE SELECTOR REMOVED --- */}
          
          {/* --- ADDED INLINE STYLE TO PUSH BUTTONS RIGHT --- */}
          <div className={styles.editorActions} style={{ marginLeft: 'auto' }}>
            {/* --- WIRE UP THE BUTTONS --- */}
            <button
              className={`${styles.actionBtn} ${styles.secondary}`}
              onClick={handleRunCode}
              disabled={isRunning}
            >
              <span>{isRunning ? 'Running...' : 'Run'}</span>
            </button>
            <button
              className={`${styles.actionBtn} ${styles.primary}`}
              onClick={handleSubmitCode}
              disabled={isRunning}
            >
              <span>{isRunning ? 'Submitting...' : 'Submit'}</span>
            </button>
          </div>
        </div>
        <div className={styles.editorContainer}>
          {/* --- PASS ALL STATE DOWN AS PROPS --- */}
          <CodeEditor
            id={typeof id === 'string' ? id : ''}
            language={language}
            codeValue={codeValue}
            onLanguageChange={onLanguageChange}
            onCodeChange={onCodeChange}
            output={output}
            isRunning={isRunning}
            submissionResult={submissionResult}
            testCases={testCases}
            problemData={ques} // Pass problemData down
          />
        </div>
      </div>

      {/* Expand button (no changes) */}
    </div>
  );
};

export default QuestionBar;
