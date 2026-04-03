import { useRouter } from 'next/router';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { useSocket } from '../../../context/SocketContext';
import UserContext from '../../../context/user';
import styles from '../../../styles/lobby.module.css';
import quizStyles from '../../../styles/Quiz.module.css';

const LobbyPage = () => {
  const router = useRouter();
  const { roomId, host } = router.query;
  const { socket, isConnected } = useSocket();
  const user = useContext(UserContext);

  const [players, setPlayers] = useState<{ id: string; username: string }[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [roomConfig, setRoomConfig] = useState<{ topic: string, difficulty: string, count: number } | null>(null);
  const [inviteLink, setInviteLink] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [waiting, setWaiting] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState('');

  // Separate effect for invite link to ensure it's always correct
  useEffect(() => {
    if (typeof window !== 'undefined' && roomId) {
      setInviteLink(`${window.location.origin}/quiz/lobby/${roomId}`);
    }
  }, [roomId]);

  useEffect(() => {
    if (!socket || !isConnected || !user || !roomId) return;

    // --- Socket Event Listeners (Register BEFORE emitting) ---
    socket.on('room_update', (data: { players: { id: string; username: string }[]; roomConfig?: any }) => {
      console.log('[LOBBY] Room Update Received:', data.players, data.roomConfig);
      setPlayers(data.players);
      if (data.roomConfig) {
        setRoomConfig(data.roomConfig);
      }
      if (data.players.length >= 2) {
        setWaiting(false);
      }
    });

    socket.on('battle_starting', (battleRoomId: string) => {
      console.log('[LOBBY] Battle starting in:', battleRoomId);
      router.push(`/quiz/battle/${battleRoomId}`);
    });

    socket.on('error', (msg: string) => {
      console.error('[LOBBY] Error received:', msg);
      setError(msg);
    });

    const currentRoomId = String(roomId);
    console.log("[LOBBY] Attempting to join room:", currentRoomId);
    socket.emit('join_private_room', { roomId: currentRoomId, username: 'Opponent' });

    if (host === 'true') {
      setIsHost(true);
    }

    return () => {
      console.log("[LOBBY] Cleaning up listeners for:", currentRoomId);
      socket.off('room_update');
      socket.off('battle_starting');
      socket.off('error');
    };
  }, [socket, isConnected, roomId, user, host, router]);

  useEffect(() => {
    if (players.length >= 2 && waiting) {
      setWaiting(false);
    }
  }, [players.length, waiting]);

  useEffect(() => {
    if (!waiting && countdown > 0 && !error) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!waiting && countdown === 0 && isHost && !error) {
      socket?.emit('start_private_battle', roomId);
    }
  }, [waiting, countdown, isHost, socket, roomId, error]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopySuccess('Link Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
      setCopySuccess('Failed to copy');
    });
  };

  if (error) {
    return (
      <div className={styles['lobby-container']}>
        <div className={styles['lobby-card']}>
          <div className={styles['error-state']}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
            <h2>Failed to start battle</h2>
            <p>{error}</p>
            <button onClick={() => router.push('/quiz')} className={styles['start-battle-button']}>
              Back to Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={quizStyles['centerScreen']}>
      <div className={quizStyles['matchmaking-loader']}>
        {waiting ? (
          <>
            <div className={quizStyles['spinner']}></div>
            <h3>{isHost ? 'Waiting for opponent...' : 'Waiting for host...'}</h3>
            <p>The battle will start once both players are ready.</p>
            <div className={quizStyles['player-count']}>
              Players: {players.length}/2
            </div>

            {isHost && (
              <div className={styles['invite-link-section']} style={{ marginTop: '2rem' }}>
                <p>Share this link with your friend:</p>
                <div className={styles['invite-input-group']}>
                  <input type="text" value={inviteLink} readOnly />
                  <button
                    className={`${styles['copy-btn']} ${copySuccess ? styles.success : ''}`}
                    onClick={copyToClipboard}
                  >
                    {copySuccess || 'Copy Link'}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles['countdown-container']}>
            <p className={styles['status-text']}>Opponent joined! Starting in...</p>
            <div className={styles['countdown-number']}>
              {countdown}
            </div>
          </div>
        )}

        {roomConfig && (
          <div className={styles['room-config-display']} style={{ marginTop: '2rem' }}>
            <p><strong>Topic:</strong> {roomConfig.topic}</p>
            <p><strong>Difficulty:</strong> {roomConfig.difficulty} | <strong>Questions:</strong> {roomConfig.count}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LobbyPage;

