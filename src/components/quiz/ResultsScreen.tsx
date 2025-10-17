// 📁 /components/quiz/ResultsScreen.tsx

import React from 'react';
import styles from '../../styles/Quiz.module.css';
import { Question, QuizAction } from '../../types/quiz';

interface Props {
  score: number;
  totalQuestions: number;
  questions: Question[];
  userAnswers: (string | null)[];
  dispatch: React.Dispatch<QuizAction>;
}

const ResultsScreen: React.FC<Props> = ({ score, totalQuestions, questions, userAnswers, dispatch }) => {
  return (
    <div className={styles['results-container']}>
      <h2 className={styles['section-title']}>Your Quiz Results</h2>

      <div className={`${styles['stats-container']}`}>
        <div className={`${styles['stat-card']} ${styles.correct}`}>
          <h3 className={styles['stat-value']}>{score}</h3>
          <p className={styles['stat-label']}>Correct Answers</p>
        </div>
        <div className={`${styles['stat-card']} ${styles.wrong}`}>
          <h3 className={styles['stat-value']}>{totalQuestions - score}</h3>
          <p className={styles['stat-label']}>Wrong Answers</p>
        </div>
      </div>
      
      <div className={styles['review-section']}>
        <h2 className={styles['section-title']}>Review Answers</h2>
        <ul className={styles['review-list']}>
          {questions.map((q, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === q.answer;
            return (
              <li key={index} className={styles['review-item']}>
                <h3 className={styles['quiz-question']}>{`Q${index + 1}: ${q.question}`}</h3>
                <ul className={styles['quiz-options']}>
                  {['A', 'B', 'C', 'D'].map((letter) => {
                    const optionKey = `option${letter}` as keyof Question;
                    const isUserChoice = userAnswer === optionKey;
                    const isCorrectAnswer = q.answer === optionKey;
                    
                    let className = '';
                    if (isCorrectAnswer) className = styles['correct-option'];
                    if (isUserChoice && !isCorrectAnswer) className = styles['wrong-option'];

                    return (
                      <li key={letter} className={className}>
                        {q[optionKey]}
                        {isCorrectAnswer && ' ✅'}
                        {isUserChoice && !isCorrectAnswer && ' ❌'}
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={styles['quiz-navigation']}>
        <button className={styles['quiz-button']} onClick={() => dispatch({ type: 'RESTART' })}>
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;