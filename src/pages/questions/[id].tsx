import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../../styles/CodeEditor.module.css';
import CodeEditor from '../../common/components/CodeEditor/CodeEditor';
import { db } from '../../lib/firebase';

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

  useEffect(() => {
    const fetchQuestion = async () => {
      if (typeof id === 'string') {
        try {
          const docRef = doc(db, 'problems', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setQues(docSnap.data() as Problem);
          } else {
            console.warn('No such question found!');
          }
        } catch (error) {
          console.error('Error fetching question:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchQuestion();
  }, [id]);

  const toggleLeftPanel = () => {
    setLeftPanelCollapsed(!leftPanelCollapsed);
  };

  return (
    <div className={styles.container}>
      {/* Left Panel - Problem Description */}
      <div className={`${styles.leftPane} ${leftPanelCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Problem</h3>
          <button 
            className={styles.collapseBtn}
            onClick={toggleLeftPanel}
            aria-label="Toggle problem panel"
          >
            {leftPanelCollapsed ? '→' : '←'}
          </button>
        </div>
        
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
                    <span className={`${styles.difficultyBadge} ${styles[ques.difficulty?.toLowerCase() || 'medium']}`}>
                      {ques.difficulty || 'Medium'}
                    </span>
                  </div>
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Description</h3>
                  <div className={styles.description}>
                    {ques.description}
                  </div>
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Input Format</h3>
                  <pre className={styles.codeBlock}>{ques.input_format}</pre>
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Output Format</h3>
                  <pre className={styles.codeBlock}>{ques.output_format}</pre>
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Sample Input</h3>
                  <pre className={`${styles.codeBlock} ${styles.sampleInput}`}>{ques.test_case}</pre>
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Sample Output</h3>
                  <pre className={`${styles.codeBlock} ${styles.sampleOutput}`}>{ques.answer}</pre>
                </div>

                {ques.constraints && (
                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Constraints</h3>
                    <div className={styles.constraints}>{ques.constraints}</div>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.errorContainer}>
                <p className={styles.error}>Problem not found</p>
                <button 
                  className={styles.retryBtn}
                  onClick={() => router.reload()}
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Panel - Code Editor */}
      <div className={`${styles.rightPane} ${leftPanelCollapsed ? styles.expanded : ''}`}>
        <div className={styles.editorContainer}>
          <CodeEditor 
            id={typeof id === 'string' ? id : ''} 
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionBar;