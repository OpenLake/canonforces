import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../../styles/CodeEditor.module.css';
import CodeEditor from '../../common/components/CodeEditor/CodeEditor';
import { db, auth } from '../../lib/firebase';
import { formatDescription } from '../../utils/formatDescription';
import { increment, runTransaction, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { getPOTD } from '../../services/potd_fetch';

import {
  CODE_SNIPPETS,
  LANGUAGE_VERSIONS,
} from '../../constants/boilerplate';

const parseTestCases = (inputs: string, outputs: string) => {
  if (!inputs || !outputs) return [];
  return [{ input: inputs, output: outputs }];
};

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
    answer?: string;
    constraints?: string;
  };

  const [ques, setQues] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);

  const [language, setLanguage] = useState<string>('python');
  const [codeValue, setCodeValue] = useState(
    CODE_SNIPPETS[language as keyof typeof CODE_SNIPPETS]
  );
  const [testCases, setTestCases] = useState<any[]>([]);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);

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
        }
      } catch (error) {
        console.error('Error fetching question:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  const onLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCodeValue(CODE_SNIPPETS[newLang as keyof typeof CODE_SNIPPETS]);
    setOutput(null);
    setSubmissionResult(null);
  };

  const onCodeChange = (value: string | undefined) => {
    setCodeValue(value || '');
  };

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput(null);

    try {
      const response = await fetch('/api/hello', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          codeValue,
          input: testCases[0]?.input || '',
        }),
      });

      const data = await response.json();
      if (data.run) {
        setOutput(data.run.output || data.run.stderr || data.run.compile_output || 'Program executed successfully (no output).');
      } else if (data.error) {
        toast.error(`Execution failed: ${data.error}`);
        setOutput(`Execution failed: ${response.status}\nError: ${data.error}\nRaw Trace: ${data.rawError || 'none'}`);
      } else {
        toast.error('Failed to run code.');
        setOutput('Unknown error occurred. Check browser console for details.');
      }
    } catch (error) {
      console.error('Run Error:', error);
      toast.error('An error occurred while connecting to the execution server.');
      setOutput('A network error occurred. Please check your internet connection and try again.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      toast.error('Please login to submit your solution.');
      return;
    }

    if (!ques || !id) return;

    setIsRunning(true);
    try {
      // Direct Firestore submission (Client-Side)
      const submissionsRef = collection(db, 'contest_submissions');
      await addDoc(submissionsRef, {
        userId: auth.currentUser.uid,
        contestId: 'practice',
        problemId: id,
        problemName: ques.title,
        platform: 'CanonForces',
        language,
        code: codeValue,
        submittedAt: serverTimestamp(),
        coinsEarned: 0,
      });

      toast.success('Solution submitted successfully!');

      const potdId = await getPOTD();
      if (potdId === id) {
        await markAsSolved();
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to submit solution.');
    } finally {
      setIsRunning(false);
    }
  };

  const markAsSolved = async () => {
    if (!auth.currentUser || !id) return;

    const todayDate = new Date().toISOString().split("T")[0];
    const userRef = doc(db, "users", auth.currentUser.uid);
    const submissionRef = doc(db, "potd_submissions", todayDate);

    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const currentUserData = userDoc.exists() ? userDoc.data() : { coins: 0, streak: 0 };

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        let newStreak = 1;
        // @ts-ignore
        if (currentUserData.lastSolvedDate === yesterdayStr) {
          // @ts-ignore
          newStreak = (currentUserData.streak || 0) + 1;
          // @ts-ignore
        } else if (currentUserData.lastSolvedDate === todayDate) {
          return;
        }

        transaction.update(userRef, {
          coins: increment(5),
          streak: newStreak,
          lastSolvedDate: todayDate
        });

        transaction.set(submissionRef, {
          problemId: id,
          solvers: {
            [auth.currentUser!.uid]: {
              uid: auth.currentUser!.uid,
              username: auth.currentUser!.displayName || "User",
              solvedAt: new Date().toISOString()
            }
          }
        }, { merge: true });
      });
      toast.success("Streak updated! +5 coins awarded.");
    } catch (error) {
      console.error('Streak update failed:', error);
    }
  };

  return (
    <div className={styles.container}>
      {/* LEFT PANEL */}
      <div
        className={`${styles.leftPane} ${leftPanelCollapsed ? styles.collapsed : ''
          }`}
      >
        {!leftPanelCollapsed && (
          <div className={styles.problemContent}>
            {loading ? (
              <p className={styles.loading}>Loading problem...</p>
            ) : ques ? (
              <>
                <div className={styles.problemHeader}>
                  <h1 className={styles.title}>{ques.title}</h1>
                  <span className={styles.difficultyBadge}>
                    {ques.difficulty || 'Medium'}
                  </span>
                </div>

                {/* ✅ DESCRIPTION */}
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Description</h3>
                  <div
                    className={styles.description}
                    dangerouslySetInnerHTML={{
                      __html: formatDescription(ques.description),
                    }}
                  />
                </div>

                {/* ✅ INPUT FORMAT */}
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Input Format</h3>
                  <pre
                    className={styles.codeBlock}
                    dangerouslySetInnerHTML={{
                      __html: formatDescription(ques.input_format || ''),
                    }}
                  />
                </div>

                {/* ✅ OUTPUT FORMAT */}
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Output Format</h3>
                  <pre
                    className={styles.codeBlock}
                    dangerouslySetInnerHTML={{
                      __html: formatDescription(ques.output_format || ''),
                    }}
                  />
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Sample Input</h3>
                  <pre className={styles.codeBlock}>{ques.test_case}</pre>
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Sample Output</h3>
                  <pre className={styles.codeBlock}>{ques.answer}</pre>
                </div>

                {ques.constraints && (
                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Constraints</h3>
                    <div>{ques.constraints}</div>
                  </div>
                )}
              </>
            ) : (
              <p>Problem not found</p>
            )}
          </div>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className={styles.rightPane}>
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
          problemData={ques}
          onRun={handleRun}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default QuestionBar;
