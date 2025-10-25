import React, { useEffect, useCallback } from 'react';
import styles from '../../styles/Quiz.module.css';
import { Question, QuizAction } from '../../types/quiz';
import ProgressBar from './ProgressBar';
import Timer from './Timer'; // Import our new Timer component

interface Props {
  question: Question;
  userAnswer: string | null;
  questionNumber: number;
  totalQuestions: number;
  dispatch: React.Dispatch<QuizAction>;
}

const QUESTION_DURATION_SECONDS = 30; // Set duration for each question

const QuestionDisplay: React.FC<Props> = ({ question, userAnswer, questionNumber, totalQuestions, dispatch }) => {
  
  // Using useCallback prevents this function from being recreated on every render,
  // which is important because it's a dependency for our useEffect hook.
  const handleNext = useCallback(() => {
    if (questionNumber === totalQuestions) {
      dispatch({ type: 'FINISH_QUIZ' });
    } else {
      dispatch({ type: 'NEXT_QUESTION' });
    }
  }, [questionNumber, totalQuestions, dispatch]);

  // This useEffect hook adds and removes an event listener for keyboard shortcuts.
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Answer with keys 1, 2, 3, 4
      if (['1', '2', '3', '4'].includes(event.key)) {
        const optionMap: { [key: string]: string } = { '1': 'optionA', '2': 'optionB', '3': 'optionC', '4': 'optionD' };
        dispatch({ type: 'ANSWER', payload: optionMap[event.key] });
      }
      // Go to the next question with Enter key, but only if an answer has been selected.
      if (event.key === 'Enter' && userAnswer) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    // This cleanup function is crucial. It removes the event listener when the
    // component is unmounted, preventing memory leaks.
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [dispatch, userAnswer, handleNext]); // Dependencies array

  return (
    <div className={styles['quiz-form']}>
      <div className={styles['quiz-header']}>
        <ProgressBar current={questionNumber} total={totalQuestions} />
        {/* The `key` prop is critical. It tells React to create a new instance of the Timer
            for each question, which effectively resets the countdown. */}
        <Timer 
          key={questionNumber} 
          duration={QUESTION_DURATION_SECONDS} 
          onTimeUp={handleNext} 
        />
      </div>
      
      <h2 className={styles['quiz-question']}>
        {`Q${questionNumber}: ${question.question}`}
      </h2>

      <ul className={styles['quiz-options']}>
        {(['A', 'B', 'C', 'D'] as const).map((letter, index) => {
          const optionKey = `option${letter}` as keyof Question;
          return (
            <li key={letter}>
              <label>
                <input
                  type="radio"
                  name="q"
                  value={`option${letter}`}
                  checked={userAnswer === `option${letter}`}
                  onChange={(e) => dispatch({ type: 'ANSWER', payload: e.target.value })}
                />
                {/* Visual indicator for keyboard shortcuts */}
                <span className={styles['option-number']}>{index + 1}</span>
                {question[optionKey]}
              </label>
            </li>
          );
        })}
      </ul>
      
      <div className={styles['quiz-navigation']}>
        <button
          className={`${styles['quiz-button']} ${questionNumber === totalQuestions ? styles.submit : ''}`}
          onClick={handleNext}
          disabled={userAnswer === null}
        >
          {questionNumber !== totalQuestions ? 'Next' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default QuestionDisplay;