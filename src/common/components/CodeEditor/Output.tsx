import React, { useState } from 'react';
import { executeCode } from '../../../pages/api/hello';
import { idToProblemMap } from '../../../constants/Twomaps';
import styles from './Output.module.css';

interface OutputProps {
  id: string;
  language: string;
  value: string;
}

const Output: React.FC<OutputProps> = ({ id, language, value }) => {
  const ques = idToProblemMap[id];

  const [output, setOutput] = useState<
    { output: any; error: any; compile_output: any; status: any }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const runCode = async () => {
    if (!value) return;

    setIsLoading(true);
    try {
      const { run: result } = await executeCode(language, value, ques.test_case);
      setOutput([
        {
          output: result.output,
          error: result.stderr,
          compile_output: result.compile_output,
          status: result.status,
        },
      ]);
      setIsError(result.status !== 'Accepted');
    } catch (error) {
      console.log(error);
      alert('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.button}
        onClick={runCode}
        disabled={isLoading}
      >
        {isLoading ? 'Running...' : 'Run Code'}
      </button>

      <div className={`${styles.outputBox} ${isError ? styles.error : ''}`}>
        {output.length > 0 ? (
          output.map((res, i) => (
            <div className={styles.resultBlock} key={i}>
              {/* <p className={styles.label}>Input:</p>
              <p className={styles.text}>{ques.test_case}</p> */}
              <p className={styles.label}>Output:</p>
              <p
                className={`${styles.text} ${
                  res.status === 'Accepted' ? styles.success : styles.fail
                }`}
              >
                {res.output || res.compile_output || res.error || res.status}
              </p>
            </div>
          ))
        ) : (
          <p>Click &quot;Run Code&quot; to see the output here</p>
        )}
      </div>
    </div>
  );
};

export default Output;
