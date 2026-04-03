import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { BsTrophyFill, BsCoin, BsArrowCounterclockwise, BsHouse } from 'react-icons/bs';
import styles from '../../styles/BattleResults.module.css';

interface BattleResultsProps {
    myScore: number;
    opponentScore: number;
    myTotalTime: number;
    opponentTotalTime: number;
    coinsEarned: number;
    rematchRequested: boolean;
    opponentWantsRematch: boolean;
    handleRematch: () => void;
    totalQuestions: number;
    isSaving: boolean;
    myUsername: string;
    opponentUsername: string;
}

const CountUp: React.FC<{ value: number; duration?: number }> = ({ value, duration = 1.5 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        if (start === end) {
            setCount(end);
            return;
        };

        let totalMiliseconds = duration * 1000;
        let incrementTime = totalMiliseconds / end;

        let timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start === end) clearInterval(timer);
        }, incrementTime);

        return () => clearInterval(timer);
    }, [value, duration]);

    return <>{count}</>;
};

const BattleResults: React.FC<BattleResultsProps> = ({
    myScore,
    opponentScore,
    myTotalTime,
    opponentTotalTime,
    coinsEarned,
    rematchRequested,
    opponentWantsRematch,
    handleRematch,
    totalQuestions,
    isSaving,
    myUsername,
    opponentUsername
}) => {
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const localWinner = myScore > opponentScore ? 'me' :
        myScore < opponentScore ? 'opponent' : 'draw';

    const resultTitle = localWinner === 'me' ? 'WINNER!' : localWinner === 'opponent' ? 'DEFEATED' : 'DRAW';
    const accuracy = Math.round((myScore / totalQuestions) * 100);
    const opponentAccuracy = Math.round((opponentScore / totalQuestions) * 100);

    return (
        <div className={styles['results-overlay']}>
            {localWinner === 'me' && (
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={false}
                    numberOfPieces={500}
                    gravity={0.15}
                />
            )}

            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={styles['result-card']}
            >
                <div className={styles['result-header']}>
                    {localWinner === 'me' && <BsTrophyFill className={styles['trophy-icon']} />}
                    <h1 className={styles['result-title']}>{resultTitle}</h1>
                    <p className={styles['result-subtitle']}>
                        {localWinner === 'me' ? 'Impressive performance! You won the battle.' : 
                         localWinner === 'opponent' ? 'Tough battle. You will get them next time!' : 
                         'What a match! You are perfectly balanced.'}
                    </p>
                </div>

                <div className={styles['vs-section']}>
                    {/* Player (You) */}
                    <div className={`${styles['player-card']} ${localWinner === 'me' ? styles.winner : ''}`}>
                        <div className={styles['player-info']}>
                            <div className={styles['player-avatar']} style={{ background: '#007bff' }}>👤</div>
                            <span className={styles['player-name']}>{myUsername}</span>
                        </div>
                        <div className={styles['stat-row']}>
                            <span className={styles['stat-label']}>Points</span>
                            <span className={`${styles['stat-value']} ${styles['points-value']}`}>
                                <CountUp value={myScore} />
                            </span>
                        </div>
                        <div className={styles['stat-row']}>
                            <span className={styles['stat-label']}>Accuracy</span>
                            <span className={styles['stat-value']}>{accuracy}%</span>
                        </div>
                    </div>

                    <div className={styles['vs-divider']}>VS</div>

                    {/* Opponent */}
                    <div className={`${styles['player-card']} ${localWinner === 'opponent' ? styles.winner : ''}`}>
                        <div className={styles['player-info']}>
                            <div className={styles['player-avatar']} style={{ background: '#f43f5e' }}>👾</div>
                            <span className={styles['player-name']}>{opponentUsername}</span>
                        </div>
                        <div className={styles['stat-row']}>
                            <span className={styles['stat-label']}>Points</span>
                            <span className={`${styles['stat-value']} ${styles['points-value']}`}>
                                <CountUp value={opponentScore} />
                            </span>
                        </div>
                        <div className={styles['stat-row']}>
                            <span className={styles['stat-label']}>Accuracy</span>
                            <span className={styles['stat-value']}>{opponentAccuracy}%</span>
                        </div>
                    </div>
                </div>

                <div className={styles['rewards-card']}>
                    <div className={styles['reward-content']}>
                        <BsCoin className={styles['coin-icon']} />
                        <span className={styles['reward-title']}>Battle Rewards</span>
                    </div>
                    <span className={styles['reward-amount']}>
                        {isSaving ? '...' : `+${coinsEarned}`} Coins
                    </span>
                </div>

                <div className={styles['actions']}>
                    <button
                        className={styles['primary-button']}
                        onClick={handleRematch}
                        disabled={rematchRequested}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <BsArrowCounterclockwise />
                            {rematchRequested ? 'Waiting...' : 'Rematch'}
                        </div>
                    </button>
                    <button
                        className={styles['secondary-button']}
                        onClick={() => window.location.href = '/quiz'}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <BsHouse />
                            Back Home
                        </div>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default BattleResults;
