import { useRouter } from 'next/router';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { useSocket } from '../../../context/SocketContext';
import UserContext from '../../../context/user';
import styles from '../../../styles/lobby.module.css';

const LobbyPage = () => {
  const router = useRouter();
  const { roomId } = router.query;
  const { socket, isConnected } = useSocket();
  const user = useContext(UserContext);

  const [players, setPlayers] = useState<string[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const hasJoinedRef = useRef(false);
  const [waiting, setWaiting] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Generate the invite link once the page loads
    setInviteLink(`${window.location.origin}/quiz/lobby/${roomId}`);

    // We must have a socket and user to proceed
    if (!socket || !isConnected || !user || !roomId || hasJoinedRef.current) return;

    // Emit an event to join the room
    socket.emit('join_private_room', roomId);
    hasJoinedRef.current = true;

    // We'll assume the first person to join is the host
    // A more robust way is to pass host info, but this is simpler
    if (players.length === 0) {
      setIsHost(true);
    }
    setPlayers(prev => [...prev, user.username || user.uid]); // Add self to list

    // --- Socket Event Listeners ---

    // Listen for another player joining
    socket.on('player_joined', (playerSocketId: string) => {
      console.log('Another player joined:', playerSocketId);
      // In a real app, you'd get their username, but for now, we'll just add a placeholder
      setPlayers(prev => [...prev, `Opponent (${playerSocketId.substring(0, 4)})`]);
    });

    // Listen for the "battle_starting" event from the host
    socket.on('battle_starting', (battleRoomId: string) => {
      router.push(`/quiz/battle/${battleRoomId}`);
    });

    // Clean up listeners
    return () => {
      socket.off('player_joined');
      socket.off('battle_starting');
    };
  }, [socket, isConnected, roomId, user]);

  useEffect(() => {
    if (players.length >= 2 && waiting) {
      setWaiting(false);
    }
  }, [players.length, waiting]);

  useEffect(() => {
    if (!waiting && countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!waiting && countdown === 0 && isHost) {
      socket?.emit('start_private_battle', roomId);
    }
  }, [waiting, countdown, isHost, socket, roomId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopySuccess('Link Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
      setCopySuccess('Failed to copy');
    });
  };

  const startBattle = () => {
    if (socket && isHost) {
      // Tell the server to start the battle for everyone in this room
      socket.emit('start_private_battle', roomId);
    }
  };

  return (
    <div className={styles['lobby-container']}>
      <div className={styles['lobby-card']}>
        <h2>Private Battle Lobby</h2>
        <p>Share this link with your friend to invite them.</p>

        <div className={styles['invite-link-wrapper']}>
          <input type="text" value={inviteLink} readOnly />
          <button onClick={copyToClipboard} className={styles['copy-button']}>
            {copySuccess || 'Copy'}
          </button>
        </div>

        <div className={styles['waiting-status']}>
          {waiting ? (
            <div className={styles['radar-container']}>
              <div className={styles['radar']}>
                <div className={styles['sweep']} />
                <div className={styles['circle']} />
                <div className={styles['circle']} />
                <div className={styles['circle']} />
                {/* Blips to represent "finding" someone */}
                <div className={`${styles['blip']} ${styles['blip-1']}`} />
                <div className={`${styles['blip']} ${styles['blip-2']}`} />
              </div>
              <p className={styles['status-text']}>Searching for opponent...</p>
            </div>
          ) : (
            <div className={styles['countdown-container']}>
              <p className={styles['status-text']}>Opponent joined! Starting in...</p>
              <div className={styles['countdown-number']}>{countdown}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
