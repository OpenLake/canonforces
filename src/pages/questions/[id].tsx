import React from 'react';
import { useRouter } from 'next/router';
import { idToProblemMap } from '../../constants/Twomaps';
import styles from '../../styles/CodeEditor.module.css'

const CodeEditor = () => {
  const router = useRouter();
  const { id } = router.query;

  const ques = typeof id === 'string' ? idToProblemMap[id] : undefined;

  return (
    <div className={styles.container}>
      <div className={styles.leftPane}>
        {ques ? (
          <>
            <h2 className={styles.title}>{ques.title}</h2>
            <p className={styles.section}>
              <span className={styles.label}>Description:</span>
              <br />
              {ques.description}
            </p>
            <p className={styles.section}>
              <span className={styles.label}>Input Format:</span>
              <pre className={styles.code}>{ques.input_format}</pre>
            </p>
            <p className={styles.section}>
              <span className={styles.label}>Output Format:</span>
              <pre className={styles.code}>{ques.output_format}</pre>
            </p>
            <p className={styles.section}>
              <span className={styles.label}>Sample Input:</span>
              <pre className={styles.code}>{ques.test_case}</pre>
            </p>
            <p className={styles.section}>
              <span className={styles.label}>Sample Output:</span>
              <pre className={styles.code}>{ques.answer}</pre>
            </p>
          </>
        ) : (
          <p className={styles.loading}>Loading question...</p>
        )}
      </div>

      <div className={styles.rightPane}>
        {/* You can place your actual code editor here later */}
        <div className={styles.editorPlaceholder}>
          <p style={{ color: '#ccc' }}>Editor coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
