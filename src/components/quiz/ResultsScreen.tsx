import React, { useState, useEffect } from 'react';
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
  const [feedback, setFeedback] = useState('');
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(true);

  // This effect runs once when the results screen is shown
  useEffect(() => {
    const fetchFeedback = async () => {
      // Don't fetch if there are no questions to analyze
      if (questions.length === 0) {
          setIsLoadingFeedback(false);
          setFeedback("No results to analyze for feedback.");
          return;
      }
      
      setIsLoadingFeedback(true);
      try {
        const response = await fetch('/api/quiz/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questions, userAnswers }),
        });
        if (!response.ok) throw new Error('Feedback request failed');
        const data = await response.json();
        setFeedback(data.feedback);
      } catch (error) {
        console.error(error);
        setFeedback("Couldn't load AI feedback at this time.");
      } finally {
        setIsLoadingFeedback(false);
      }
    };

    fetchFeedback();
  }, [questions, userAnswers]); // Dependencies ensure it only runs when results are available


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
  const showConfetti = accuracy >= 80;

  return (
    <div className={styles['results-container']}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={400} />}
      
      <h2 className={styles['section-title']}>Quiz Complete! 🥳</h2>

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
      
      {/* NEW AI Feedback Card is now integrated */}
      <div className={styles['ai-feedback-card']}>
        <div className={styles['ai-feedback-header']}>
          <span className={styles['ai-feedback-avatar']}>🤖</span>
          <h3 className={styles['ai-feedback-title']}>Feedback Results</h3>
        </div>
        <p className={styles['ai-feedback-text']}>
          {isLoadingFeedback ? 'Analyzing your results...' : feedback}
        </p>
      </div>

      <div className={styles['review-section']}>
        <h2 className={styles['section-title']}>Review Answers</h2>
        <ul className={styles['review-list']}>
          {questions.map((q, index) => {
            const userAnswer = userAnswers[index];
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