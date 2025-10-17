// 📁 /components/quiz/QuestionDisplay.tsx

import React from 'react';
import styles from '../../styles/Quiz.module.css';
import { Question, QuizAction } from '../../types/quiz';
import ProgressBar from './ProgressBar';

interface Props {
  question: Question;
  userAnswer: string | null;
  questionNumber: number;
  totalQuestions: number;
  dispatch: React.Dispatch<QuizAction>;
}

const QuestionDisplay: React.FC<Props> = ({ question, userAnswer, questionNumber, totalQuestions, dispatch }) => {
  const handleNext = () => {
    if (questionNumber === totalQuestions) {
      dispatch({ type: 'FINISH_QUIZ' });
      document.exitFullscreen().catch(err => console.log(err));
    } else {
      dispatch({ type: 'NEXT_QUESTION' });
    }
  };

  return (
    <div className={styles['quiz-form']}>
      <ProgressBar current={questionNumber} total={totalQuestions} />
      <h2 className={styles['quiz-question']}>
        {`Q${questionNumber}: ${question.question}`}
      </h2>

      <ul className={styles['quiz-options']}>
        {['A', 'B', 'C', 'D'].map((letter) => {
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
          disabled={userAnswer === null} // Disable button until an answer is selected
        >
          {questionNumber !== totalQuestions ? 'Next' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default QuestionDisplay;