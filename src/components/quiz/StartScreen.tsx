// 📁 /components/quiz/StartScreen.tsx

import React, { useState } from 'react';
import styles from '../../styles/Quiz.module.css';

interface Props {
  onStart: (topic: string, difficulty: 'easy' | 'medium' | 'hard', count: number) => void;
}

const topics = [
  { id: 'dsa', name: 'DSA', value: 'Data Structures and Algorithms' },
  { id: 'cs_fundamentals', name: 'CS Fundamentals', value: 'Computer Science Fundamentals' },
  { id: 'system_design', name: 'System Design', value: 'System Design' },
  { id: 'javascript', name: 'JavaScript', value: 'JavaScript' },
];

const difficulties = ['easy', 'medium', 'hard'] as const;

const StartScreen: React.FC<Props> = ({ onStart }) => {
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedTopic, setSelectedTopic] = useState(topics[0].value);

  const handleStart = () => {
    onStart(selectedTopic, selectedDifficulty, totalQuestions);
    document.documentElement.requestFullscreen().catch(err => console.log(err));
  };

  return (
    <div className={styles['start-quiz-container']}>
      <div className={styles['config-card']}>
        
        {/* Topic Selection */}
        <div className={styles['config-section']}>
          <h3 className={styles['config-title']}>1. Select a Topic</h3>
          <div className={styles['card-options-grid']}>
            {topics.map(topic => (
              <button 
                key={topic.id} 
                onClick={() => setSelectedTopic(topic.value)} 
                className={`${styles['option-card']} ${selectedTopic === topic.value ? styles.active : ''}`}
              >
                {topic.name}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className={styles['config-section']}>
          <h3 className={styles['config-title']}>2. Choose Difficulty</h3>
          <div className={styles['difficulty-options']}>
            {difficulties.map(d => (
              <button 
                key={d} 
                onClick={() => setSelectedDifficulty(d)} 
                className={`${styles['difficulty-button']} ${selectedDifficulty === d ? styles.active : ''} ${styles[d]}`}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Number of Questions Slider */}
        <div className={styles['config-section']}>
          <h3 className={styles['config-title']}>3. Set Number of Questions</h3>
          <div className={styles['slider-wrapper']}>
            <span className={styles['slider-value']}>{totalQuestions}</span>
            <input
              id="questionSlider"
              type="range"
              min="3"
              max="20"
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value))}
              className={styles['slider']}
            />
          </div>
        </div>

        <button className={styles['start-button-large']} onClick={handleStart}>
          Generate Quiz & Start
        </button>

      </div>
    </div>
  );
};

export default StartScreen;