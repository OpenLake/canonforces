import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../../styles/CodeEditor.module.css';
import CodeEditor from '../../common/components/CodeEditor/CodeEditor';
import { db, auth } from '../../lib/firebase';
import { formatDescription } from '../../utils/formatDescription';
import { increment, runTransaction, setDoc, addDoc, collection, serverTimestamp, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { checkCodeforcesSubmission } from '../../services/codeforces_api';
import { toast } from 'sonner';
import { getPOTD } from '../../services/potd_fetch';

import {
  CODE_SNIPPETS,
  LANGUAGE_VERSIONS,
} from '../../constants/boilerplate';

const parseTestCases = (inputs: string, outputs: string) => {
  if (!inputs && !outputs) return [];
  return [{ input: inputs || '', output: outputs || '' }];
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
    problemUrl?: string;
    rating?: number;
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
  const [cfUsername, setCfUsername] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);

  // AI Hint States
  const [aiHints, setAiHints] = useState<[string, string, string] | null>(null);
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [isFetchingHint, setIsFetchingHint] = useState<boolean>(false);
  const HINT_COST = 10;

  useEffect(() => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCfUsername(data.username || "");
      }
    });
    return () => unsubscribe();
  }, [auth.currentUser]);

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

  const handleGetHint = async () => {
    if (!auth.currentUser || !ques) {
      toast.error('You must be logged in to get AI hints.');
      return;
    }

    if (hintLevel >= 3) {
      toast.info('All 3 hints are already revealed!');
      return;
    }

    setIsFetchingHint(true);

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);

      // Step 1: Transaction to deduct coins FIRST safely
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw new Error("User not found");

        const currentCoins = userDoc.data().coins || 0;
        if (currentCoins < HINT_COST) {
          throw new Error(`Not enough coins! You need ${HINT_COST} coins for a hint.`);
        }

        transaction.update(userRef, {
          coins: increment(-HINT_COST)
        });
      });

      // Step 2: If we are at level 0, we need to actually fetch from the API
      if (hintLevel === 0) {
        toast.info("Generating AI Hints... (This costs 10 coins)");
        const response = await fetch('/api/ai-hint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problemTitle: ques.title,
            problemDescription: ques.description,
            userCode: codeValue,
            language: language,
            errorOutput: output || null
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to fetch hints from AI.");
        }

        const data = await response.json();
        setAiHints(data.hints);
        setHintLevel(1);
        toast.success(`10 coins deducted. Topic Hint Revealed!`);
      } else {
        // Step 3: If we already have the hints, just increment the level
        setHintLevel(prev => prev + 1);
        toast.success(`10 coins deducted. Hint ${hintLevel + 1} Revealed!`);
      }

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'An error occurred while getting the hint.');
    } finally {
      setIsFetchingHint(false);
    }
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      toast.error('Please login to submit your solution.');
      return;
    }

    if (!ques || !id) return;
    if (!testCases || testCases.length === 0) {
      toast.error("No test cases to run against.");
      return;
    }

    setIsRunning(true);
    setSubmissionResult(null);
    setOutput(null);

    try {
      let allPassed = true;
      const results = [];

      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const response = await fetch('/api/hello', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language,
            codeValue,
            input: tc.input || '',
          }),
        });

        const data = await response.json();
        if (data.run) {
          const actualOutput = (data.run.output || '').trim();
          const expectedOutput = (tc.output || '').trim();

          if (actualOutput === expectedOutput) {
            results.push({ status: 'Accepted' });
          } else {
            results.push({ status: 'Wrong Answer' });
            allPassed = false;
          }
        } else {
          results.push({ status: 'Runtime Error' });
          allPassed = false;
        }
      }

      setSubmissionResult({
        status: allPassed ? 'Accepted' : 'Rejected',
        message: allPassed ? 'All test cases passed!' : 'Some test cases failed.',
        results
      });

      if (allPassed) {
        toast.success('All test cases passed! 🚀 Use "Verify on CF" to get points.');

        // Save local history record (0 coins)
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
      } else {
        toast.error('Some test cases failed. Check the Test Cases tab.');
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

  const handleVerifyCodeforces = async () => {
    console.log("Verify Codeforces button clicked.");
    if (!auth.currentUser) {
      console.log("auth.currentUser is null");
      toast.error('Please login to verify your solution.');
      return;
    }
    console.log("auth.currentUser:", auth.currentUser.uid);
    console.log("cfUsername from DB:", cfUsername);

    if (!cfUsername) {
      toast.error("Please set your Codeforces username in your profile settings.");
      return;
    }
    if (!ques || !id) {
      console.log("ques or id missing", { ques, id });
      return;
    }
    if (!ques.problemUrl) {
      console.log("ques.problemUrl missing");
      toast.error('This problem does not have a Codeforces URL to verify against.');
      return;
    }

    setIsVerifying(true);
    console.log("Setting isVerifying to true. problemUrl:", ques.problemUrl);
    try {
      // Handle both /problemset/problem/123/A and /contest/123/problem/A formats
      const urlMatch = ques.problemUrl.match(/codeforces\.com\/(?:problemset\/problem|contest)\/(\d+)\/(?:problem\/)?([A-Z]\d?)/);
      console.log("urlMatch result:", urlMatch);
      if (!urlMatch) {
        toast.error("Invalid Codeforces problem URL for verification");
        return;
      }
      const [, contestId, problemIndex] = urlMatch;
      console.log("Calling checkCodeforcesSubmission with:", { cfUsername, contestId, problemIndex });
      const hasSolved = await checkCodeforcesSubmission(cfUsername, contestId, problemIndex);
      console.log("checkCodeforcesSubmission returned:", hasSolved);

      if (hasSolved) {
        console.log("Recording submission in Firestore...");
        // Add the submission record to track completion in CanonForces
        const submissionsRef = collection(db, 'contest_submissions');
        await addDoc(submissionsRef, {
          userId: auth.currentUser.uid,
          contestId: 'practice',
          problemId: id,
          problemName: ques.title,
          platform: 'Codeforces',
          language: 'Verified',
          code: 'Verified via Codeforces API connection.',
          submittedAt: serverTimestamp(),
          coinsEarned: 5,
        });

        console.log("Updating user solvedQuestions array...");
        // Update the user's solvedQuestions array to mark it complete in QuesList UI
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const todayStr = new Date().toISOString().split('T')[0];

        if (ques.rating) {
          await updateDoc(userRef, {
            [`solvedQuestions.${ques.rating}`]: arrayUnion(id),
            lastSolvedDate: todayStr
          });
        } else {
          // Fallback if the problem doesn't have a rating
          await updateDoc(userRef, {
            [`solvedQuestions.Unrated`]: arrayUnion(id),
            lastSolvedDate: todayStr
          });
        }

        console.log("Checking POTD status...");
        // Award the POTD streak if this happens to be the POTD
        const potdId = await getPOTD();
        if (potdId === id) {
          await markAsSolved();
        }

        console.log("Verification complete. Showing success toast.");
        toast.success("🎉 Verified! Solution found on Codeforces. Points awarded!");
      } else {
        console.log("Submission was NOT found on Codeforces.");
        toast.error("No accepted submission found on Codeforces.");
      }
    } catch (error: any) {
      console.error("Error in handleVerifyCodeforces:", error);
      toast.error(error.message || "Failed to verify.");
    } finally {
      console.log("Setting isVerifying to false.");
      setIsVerifying(false);
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
          onVerify={handleVerifyCodeforces}
          isVerifying={isVerifying}
          aiHints={aiHints}
          hintLevel={hintLevel}
          isFetchingHint={isFetchingHint}
          onGetHint={handleGetHint}
        />
      </div>
    </div>
  );
};

export default QuestionBar;
