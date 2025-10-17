import React from 'react';
import Confetti from 'react-confetti';
import styles from '../../styles/Quiz.module.css';
import { Question, QuizAction } from '../../types/quiz';

interface Props {
  score: number;
  totalQuestions: number;
  questions: Question[];
  userAnswers: (string | null)[];
  dispatch: React.Dispatch<QuizAction>;
  coinsEarned: number;
}

const ResultsScreen: React.FC<Props> = ({ score, totalQuestions, questions, userAnswers, dispatch, coinsEarned }) => {
  // Return null or a placeholder if totalQuestions is 0 to avoid division by zero
  if (totalQuestions === 0) {
    return (
        <div className={styles['results-container']}>
            <p>No questions were loaded for this quiz.</p>
            <button className={styles['quiz-button']} onClick={() => dispatch({ type: 'RESTART' })}>
              Try Again
            </button>
        </div>
    );
  }

  const accuracy = Math.round((score / totalQuestions) * 100);
  const showConfetti = accuracy >= 80; // Only show confetti for good scores!

  return (
    <div className={styles['results-container']}>
      {/* 1. Confetti effect for high scores */}
      {showConfetti && <Confetti recycle={false} numberOfPieces={400} />}
      
      <h2 className={styles['section-title']}>Quiz Complete! 🥳</h2>

      {/* 2. New Rewards Summary Card */}
      <div className={styles['rewards-summary-card']}>
        <div className={styles['reward-item']}>
          <span className={styles['reward-label']}>Accuracy</span>
          <span className={styles['reward-value']}>{accuracy}%</span>
        </div>
        <div className={styles['reward-item']}>
          <span className={styles['reward-label']}>Coins Earned</span>
          <span className={styles['reward-value-coins']}>+ {coinsEarned} 🪙</span>
        </div>
      </div>

      {/* 3. Original Correct/Wrong Stats */}
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
      
      {/* 4. Original Review Answers Section */}
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

      {/* 5. Final "Try Again" Button */}
      <div className={styles['quiz-navigation']}>
        <button className={styles['quiz-button']} onClick={() => dispatch({ type: 'RESTART' })}>
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;