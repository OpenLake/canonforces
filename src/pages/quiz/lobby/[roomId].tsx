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

  const [players, setPlayers] = useState<string[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const hasJoinedRef = useRef(false);
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

    const currentRoomId = String(roomId);
    console.log("[LOBBY] Attempting to join room:", currentRoomId);
    socket.emit('join_private_room', currentRoomId);

    if (host === 'true') {
      setIsHost(true);
    }

    // --- Socket Event Listeners ---
    socket.on('room_update', (data: { players: string[]; roomConfig?: any }) => {
      console.log('[LOBBY] Room Update Received:', data.players);
      setPlayers(data.players);
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
            <h3>Waiting for host...</h3>
            <p>The battle will start once both players are ready.</p>
            <div className={quizStyles['player-count']}>
              Players: {players.length}/2
            </div>
          </>
        ) : (
          <div className={styles['countdown-container']}>
            <p className={quizStyles['status-text'] || styles['status-text']}>Opponent joined! Starting in...</p>
            <div className={styles['countdown-number']}>
              {countdown}
            </div>
          </div>
        )}

        {/* Subtle invite link just in case the guest wants to share it too */}
        {waiting && (
          <div className={quizStyles['invite-link-section']} style={{ marginTop: '2rem', opacity: 0.7 }}>
            <p style={{ fontSize: '0.8rem' }}>Invite another friend?</p>
            <div className={quizStyles['invite-input-group']}>
              <input type="text" value={inviteLink} readOnly style={{ fontSize: '0.8rem' }} />
              <button
                className={`${quizStyles['copy-btn']} ${copySuccess ? quizStyles.success : ''}`}
                onClick={copyToClipboard}
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              >
                {copySuccess || 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LobbyPage;
