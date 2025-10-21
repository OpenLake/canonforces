import { useRouter } from 'next/router';
import React, { useEffect, useState, useContext } from 'react';
import { useSocket } from '../../../../context/SocketContext';
import UserContext from '../../../../context/user';
import styles from '../../../../styles/Lobby.module.css';

const LobbyPage = () => {
  const router = useRouter();
  const { roomId } = router.query;
  const { socket, isConnected } = useSocket();
  const user = useContext(UserContext);

  const [players, setPlayers] = useState<string[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    // Generate the invite link once the page loads
    setInviteLink(`${window.location.origin}/quiz/lobby/${roomId}`);

    // We must have a socket and user to proceed
    if (!socket || !isConnected || !user) return;

    // Emit an event to join the room
    socket.emit('join_private_room', roomId);
    
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
  }, [socket, isConnected, roomId, user, router, players.length]);

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

        <div className={styles['players-list']}>
          <h4>Players in Lobby:</h4>
          <ul>
            {players.map((player, index) => (
              <li key={index}>{player}</li>
            ))}
            {players.length === 1 && <li>Waiting for opponent...</li>}
          </ul>
        </div>

        {isHost && (
          <button 
            className={styles['start-battle-button']} 
            onClick={startBattle}
            disabled={players.length < 2} // Can only start with 2 players
          >
            Start Battle
          </button>
        )}
      </div>
    </div>
  );
};

export default LobbyPage;