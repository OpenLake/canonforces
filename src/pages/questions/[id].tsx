import React from 'react';
import { useRouter } from 'next/router';
import { idToProblemMap } from '../../constants/Twomaps';
import styles from '../../styles/CodeEditor.module.css'
import CodeEditor from '../../common/components/CodeEditor/CodeEditor';

const QuestionBar = () => {
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
          <CodeEditor id={typeof id === 'string' ? id : ''} />
        </div>
      </div>
    </div>
  );
};

export default QuestionBar;
