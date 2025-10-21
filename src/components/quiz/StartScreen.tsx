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
    <p>This may take a moment. Don't close this window.</p>
    {/* We can add a "Cancel" button here later */}
  </div>
);

const StartScreen: React.FC<Props> = ({ onStart }) => {
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedTopic, setSelectedTopic] = useState(topics[0].value);
  
  const [isMatchmaking, setIsMatchmaking] = useState(false); // New state for matchmaking UI

  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const user = useContext(UserContext); // Get the logged-in user

  // --- 1. Handler for the "Generate Quiz" button (your existing logic) ---
  const handleStartSolo = () => {
    onStart(selectedTopic, selectedDifficulty, totalQuestions);
    // Request fullscreen for solo quiz
    document.documentElement.requestFullscreen().catch(err => console.log(err.message));
  };

  // --- 2. Handler for the "Invite Friend" button ---
  const handleCreatePrivateBattle = async () => {
    try {
      const response = await fetch('/api/quiz/battle/create', {
        method: 'POST',
      });
      const { roomId } = await response.json();
      
      // Redirect to a new lobby page that we will create
      router.push(`/quiz/lobby/${roomId}`);
    } catch (error) {
      console.error('Failed to create private battle:', error);
      // You could show a toast notification here
    }
  };

  // --- 3. Handler for the "Find a Match" button ---
  const handleFindMatch = () => {
    if (!socket || !isConnected || !user) {
      console.error('Socket not connected or user not logged in.');
      // Optionally, show a toast to the user
      return;
    }

    setIsMatchmaking(true); // Show the loader
    
    // Tell the server we want to join the queue
    socket.emit('join_random_queue', user.uid);

    // Listen for the "match_found" event from the server
    socket.on('match_found', (roomId: string) => {
      // A match is found! Redirect to the battle page
      // We'll also request fullscreen for the battle
      document.documentElement.requestFullscreen().catch(err => console.log(err.message));
      router.push(`/quiz/battle/${roomId}`);
    });
    
    // It's good practice to also handle a "queue_failed" or "match_timeout" event
  };

  // If we are matchmaking, show the loader instead of the options
  if (isMatchmaking) {
    return <MatchmakingLoader />;
  }

  // This is the main return
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

        {/* Updated Button Section */}
        <div className={styles['start-button-group']}>
          {/* Button 1: Solo Quiz */}
          <button className={styles['start-button-large']} onClick={handleStartSolo}>
            Generate Solo Quiz
          </button>
          
          {/* Button 2: 1v1 Random */}
          <button 
            className={`${styles['start-button-secondary']} ${styles.blue}`} 
            onClick={handleFindMatch}
            disabled={!isConnected}
          >
            Find a Match (1v1)
          </button>
          
          {/* Button 3: 1v1 Private */}
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