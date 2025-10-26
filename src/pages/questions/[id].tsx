import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../../styles/CodeEditor.module.css';
import CodeEditor from '../../common/components/CodeEditor/CodeEditor';
import { db } from '../../lib/firebase';
import { formatDescription } from '../../utils/formatDescription';
// Import the code snippets
import { CODE_SNIPPETS } from '../../constants/boilerplate';

// Helper function to parse test cases (simplified)
const parseTestCases = (inputs, outputs) => {
  if (!inputs || !outputs) {
    return [];
  }
  // This is a simple parser. It assumes one input and one output.
  // You can make this more complex later if needed.
  return [
    {
      input: inputs,
      output: outputs,
    },
  ];
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
    answer?: string;
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
          // Parse test cases when problem data is loaded
          setTestCases(
            parseTestCases(problemData.test_case, problemData.answer)
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
  };

  const onCodeChange = (value: string | undefined) => {
    setCodeValue(value || '');
  };

  const handleRunCode = () => {
    // This is where you would call your code execution API
    console.log('Running code:', { language, codeValue });
    setIsRunning(true);
    setOutput('Running your code...');
    setSubmissionResult(null); // Clear old submission results

    // Simulate an API call
    setTimeout(() => {
      setIsRunning(false);
      // This is mock output. Replace with your API's response.
      const mockOutput = `Hello, CanonForces!
Your code ran successfully.`;
      setOutput(mockOutput);
    }, 1500);
  };

  const handleSubmitCode = () => {
    // This is where you would call your submission API
    console.log('Submitting code:', { language, codeValue });
    setIsRunning(true);
    setOutput('Submitting your code for judging...');
    setSubmissionResult(null);

    // Simulate an API call
    setTimeout(() => {
      setIsRunning(false);
      // This is mock submission output. Replace with your API's response.
      const mockResult = {
        status: 'Accepted',
        message: 'All test cases passed!',
      };
      // Set submissionResult to show status (e.g., green "Accepted")
      setSubmissionResult(mockResult);
      // Set output to show the message
      setOutput(mockResult.message);
    }, 2500);
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
        {/* ... all the problem description JSX ... (no changes here) ... */}
        {/* ... (this part is long, so redacting for brevity) ... */}
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
                  <pre className={`${styles.codeBlock} ${styles.sampleOutput}`}>
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
          <div className={styles.languageSelector}>
            {/* --- WIRE UP THE LANGUAGE SELECTOR --- */}
            <select
              className={`${styles.actionBtn} ${styles.secondary}`}
              value={language}
              onChange={onLanguageChange}
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>
          <div className={styles.editorActions}>
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
            problemData={ques} // Pass problemData down (in case Output needs it)
          />
        </div>
      </div>

      {/* Expand button (no changes) */}
    </div>
  );
};

export default QuestionBar;


