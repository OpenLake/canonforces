import React, { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/Quiz.module.css';
import { useSocket } from '../../context/SocketContext';
import UserContext from '../../context/user';

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

// A new component to show while matchmaking
const MatchmakingLoader = () => (
  <div className={styles['matchmaking-loader']}>
    <div className={styles['spinner']}></div>
    <h3>Finding an opponent...</h3>
    <p>This may take a moment. Don&apos;t close this window.</p>
    {/* We can add a "Cancel" button here later */}
  </div>
);

const StartScreen: React.FC<Props> = ({ onStart }) => {
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedTopic, setSelectedTopic] = useState(topics[0].value);
  
  const [isMatchmaking, setIsMatchmaking] = useState(false);

  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const user = useContext(UserContext);

  const handleStartSolo = () => {
    onStart(selectedTopic, selectedDifficulty, totalQuestions);
    document.documentElement.requestFullscreen().catch(err => console.log(err.message));
  };

  const handleCreatePrivateBattle = async () => {
    try {
      const response = await fetch('/api/quiz/battle/create', {
        method: 'POST',
      });
      const { roomId } = await response.json();
      router.push(`/quiz/lobby/${roomId}`);
    } catch (error) {
      console.error('Failed to create private battle:', error);
    }
  };

  const handleFindMatch = () => {
    if (!socket || !isConnected || !user) {
      console.error('Socket not connected or user not logged in.');
      return;
    }

    setIsMatchmaking(true);
    socket.emit('join_random_queue', user.uid);

    socket.on('match_found', (roomId: string) => {
      document.documentElement.requestFullscreen().catch(err => console.log(err.message));
      router.push(`/quiz/battle/${roomId}`);
    });
  };

  if (isMatchmaking) {
    return <MatchmakingLoader />;
  }

  return (
    <div className={styles['start-quiz-container']}>
      <div className={styles['config-card']}>
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

        <div className={styles['start-button-group']}>
          <button className={styles['start-button-large']} onClick={handleStartSolo}>
            Generate Solo Quiz
          </button>
          
          <button 
            className={`${styles['start-button-secondary']} ${styles.blue}`} 
            onClick={handleFindMatch}
            disabled={!isConnected}
          >
            Find a Match (1v1)
          </button>
          
          <button 
            className={`${styles['start-button-secondary']} ${styles.green}`} 
            onClick={handleCreatePrivateBattle}
            disabled={!isConnected}
          >
            Invite a Friend
          </button>
        </div>

        {!isConnected && (
          <p className={styles['socket-status']}>Connecting to real-time server...</p>
        )}
      </div>
    </div>
  );
};

export default StartScreen;
