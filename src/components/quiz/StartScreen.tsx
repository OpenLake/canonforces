import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/Quiz.module.css';
import { useSocket } from '../../context/SocketContext';
import UserContext from '../../context/user';
import useUser from '../../hooks/use-user';

interface Props {
  onStart: (topic: string, difficulty: 'easy' | 'medium' | 'hard', count: number) => void;
}

const topics = [
  { id: 'dsa', name: 'DSA', value: 'DSA' },
  { id: 'cs_fundamentals', name: 'CS Fundamentals', value: 'Computer Science Fundamentals' },
  { id: 'system_design', name: 'System Design', value: 'System Design' },
  { id: 'javascript', name: 'JavaScript', value: 'JavaScript' },
];

const difficulties = ['easy', 'medium', 'hard'] as const;

// A new component to show while matchmaking
const MatchmakingLoader = ({
  inviteLink,
  playerCount,
  onCopy,
  copySuccess,
  error
}: {
  inviteLink?: string;
  playerCount?: number;
  onCopy?: () => void;
  copySuccess?: string;
  error?: string;
}) => (
  <div className={styles['matchmaking-loader']}>
    {error ? (
      <div className={styles['error-state']}>
        <div className={styles['error-icon']}>⚠️</div>
        <h3>Oops! Something went wrong</h3>
        <p className={styles['error-message']}>{error}</p>
        <button
          className={styles['start-button-large']}
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    ) : (
      <>
        <div className={styles['spinner']}></div>
        <h3>{inviteLink ? 'Waiting for friend...' : 'Finding an opponent...'}</h3>
        <p>This may take a moment. Don&apos;t close this window.</p>

        {inviteLink && (
          <div className={styles['invite-link-section']}>
            <p>Share this link to invite a friend:</p>
            <div className={styles['invite-input-group']}>
              <input type="text" value={inviteLink} readOnly />
              <button
                className={`${styles['copy-btn']} ${copySuccess ? styles.success : ''}`}
                onClick={onCopy}
              >
                {copySuccess || 'Copy Link'}
              </button>
            </div>
            {playerCount !== undefined && (
              <div className={styles['player-count']}>
                Players joined: {playerCount}/2
              </div>
            )}
          </div>
        )}
      </>
    )}
  </div>
);

const StartScreen: React.FC<Props> = ({ onStart }) => {
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedTopic, setSelectedTopic] = useState(topics[0].value);

  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [inviteRoomId, setInviteRoomId] = useState('');
  const [playerCount, setPlayerCount] = useState(0);
  const [copySuccess, setCopySuccess] = useState('');
  const [errorStatus, setErrorStatus] = useState('');

  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const authUser = useContext(UserContext);
  const { user: activeUser } = useUser();

  const handleStartSolo = () => {
    onStart(selectedTopic, selectedDifficulty, totalQuestions);
  };

  const handleCreatePrivateBattle = async () => {
    try {
      const response = await fetch('/api/quiz/battle/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: selectedTopic,
          difficulty: selectedDifficulty,
          count: totalQuestions,
        }),
      });
      const { roomId } = await response.json();
      router.push(`/quiz/lobby/${roomId}?host=true`);

    } catch (error) {
      console.error('Failed to create private battle:', error);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleMatchFound = (data: string | { roomId: string; opponentName: string }) => {
      const targetRoomId = typeof data === 'string' ? data : data.roomId;
      const targetOpponentName = typeof data === 'string' ? '' : data.opponentName;
      console.log(`[START_SCREEN] Match found! Room: ${targetRoomId}, Opponent: ${targetOpponentName}`);
      router.push(`/quiz/battle/${targetRoomId}?opponentName=${encodeURIComponent(targetOpponentName)}`);
    };

    socket.on('match_found', handleMatchFound);

    // Private battle event listeners
    socket.on('room_update', (data: { players: { id: string; username: string }[] }) => {
      console.log('[START_SCREEN] Private Room Update:', data.players);
      setPlayerCount(data.players.length);
    });

    socket.on('battle_starting', (battleRoomId: string) => {
      console.log('[START_SCREEN] Battle starting in room:', battleRoomId);
      router.push(`/quiz/battle/${battleRoomId}`);
    });

    socket.on('error', (msg: string) => {
      console.error('[START_SCREEN] Socket Error:', msg);
      setErrorStatus(msg);
    });

    return () => {
      socket.off('match_found', handleMatchFound);
      socket.off('room_update');
      socket.off('battle_starting');
      socket.off('error');
    };
  }, [socket, router, inviteRoomId]);

  // Re-join queue ONLY if socket reconnects while searching
  useEffect(() => {
    if (isMatchmaking && isConnected && socket && authUser) {
      console.log("Socket reconnected/changed while matchmaking. Re-emitting join_queue.");
      socket.emit('join_queue', {
        userId: authUser.uid,
        username: activeUser?.username || 'Guest',
        topic: selectedTopic,
        difficulty: selectedDifficulty
      });
    }
  }, [isConnected]); // Only trigger on connection state changes

  const handleFindMatch = () => {
    console.log("Find Match clicked. State:", { socket: !!socket, isConnected, user: authUser?.uid });
    if (!socket || !isConnected || !authUser) {
      console.error('Socket not connected or user not logged in.');
      return;
    }

    setIsMatchmaking(true);
    socket.emit('join_queue', {
      userId: authUser.uid,
      username: activeUser?.username || 'Guest',
      topic: selectedTopic,
      difficulty: selectedDifficulty
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  if (isMatchmaking) {
    return (
      <MatchmakingLoader
        inviteLink={inviteLink}
        playerCount={playerCount}
        onCopy={handleCopyLink}
        copySuccess={copySuccess}
        error={errorStatus}
      />
    );
  }

  return (
    <div className={styles['start-quiz-container']}>
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
          disabled={!isConnected || !activeUser}
          title={!activeUser ? "Loading profile..." : ""}
        >
          {activeUser ? "Find a Match (1v1)" : "Loading Profile..."}
        </button>

        <button
          className={`${styles['start-button-secondary']} ${styles.green}`}
          onClick={handleCreatePrivateBattle}
          disabled={!isConnected || !activeUser}
          title={!activeUser ? "Loading profile..." : ""}
        >
          {activeUser ? "Invite a Friend" : "Loading..."}
        </button>
      </div>

      {!isConnected && (
        <p className={styles['socket-status']}>Connecting to real-time server...</p>
      )}
    </div>
  );
};

export default StartScreen;
