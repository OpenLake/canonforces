import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../../styles/CodeEditor.module.css';
import CodeEditor from '../../common/components/CodeEditor/CodeEditor';
import { db } from '../../lib/firebase';
import { formatDescription } from '../../utils/formatDescription';

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

  return (
    <div className={styles.container}>
      {/* LEFT PANEL */}
      <div
        className={`${styles.leftPane} ${
          leftPanelCollapsed ? styles.collapsed : ''
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
        />
      </div>
    </div>
  );
};

export default QuestionBar;
