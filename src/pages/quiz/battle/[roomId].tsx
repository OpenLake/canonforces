import React, { useEffect, useState, useContext, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSocket } from '../../../context/SocketContext';
import UserContext from '../../../context/user';
import { db } from '../../../lib/firebase';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
    BsAwardFill,
    BsCheckCircleFill,
    BsXCircleFill,
    BsLightningFill
} from 'react-icons/bs';
import styles from '../../../styles/Battle.module.css';
import lobbyStyles from '../../../styles/lobby.module.css';
import quizStyles from '../../../styles/Quiz.module.css';
import ProgressBar from '../../../components/quiz/ProgressBar';
import Confetti from 'react-confetti';

import { Question } from '../../../types/quiz';

const BattlePage = () => {
    const router = useRouter();
    const { roomId } = router.query;
    const { socket, isConnected } = useSocket();
    const user = useContext(UserContext);

    const [questions, setQuestions] = useState<Question[]>([]);
    const [index, setIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [myScore, setMyScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [opponentProgress, setOpponentProgress] = useState(0);
    const [myTotalTime, setMyTotalTime] = useState(0);
    const [opponentTotalTime, setOpponentTotalTime] = useState(0);
    const [winner, setWinner] = useState<'me' | 'opponent' | 'draw' | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [coinsEarned, setCoinsEarned] = useState(0);
    const [rematchRequested, setRematchRequested] = useState(false);
    const [opponentWantsRematch, setOpponentWantsRematch] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    const questionStartTime = useRef(Date.now());
    const hasSavedRef = useRef(false);
    const currentIndexRef = useRef(0);
    const questionsRef = useRef<Question[]>([]);

    // Keep refs in sync with state for socket listeners (avoid stale closures)
    useEffect(() => {
        currentIndexRef.current = index;
    }, [index]);

    useEffect(() => {
        questionsRef.current = questions;
    }, [questions]);

    // 0. Reset state when roomId changes (Crucial for Rematches)
    useEffect(() => {
        setIndex(0);
        setSelectedAnswer(null);
        setIsFinished(false);
        setTimeLeft(60);
        setMyScore(0);
        setOpponentScore(0);
        setOpponentProgress(0);
        setMyTotalTime(0);
        setOpponentTotalTime(0);
        setWinner(null);
        setCoinsEarned(0);
        setRematchRequested(false);
        setOpponentWantsRematch(false);
        hasSavedRef.current = false;
        currentIndexRef.current = 0;
        questionsRef.current = [];
        setQuestions([]); // Trigger a fresh fetch
    }, [roomId]);

    // Handle Window Resize for Confetti
    useEffect(() => {
        const updateSize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // 1. Fetch questions and join the battle room
    useEffect(() => {
        if (!roomId || !socket || !isConnected) return;

        console.log("Joining battle room:", roomId);
        socket.emit('join_battle', roomId as string);

        fetch(`/api/quiz/questions/${roomId}`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                console.log("Fetched questions:", data);
                if (data.questions) setQuestions(data.questions);
                else console.error("No questions in response data:", data);
            })
            .catch(err => console.error('Failed to fetch battle questions:', err));

        const handleUpdate = (update: { score: number, totalTime: number, progress: number }) => {
            console.log("Opponent speed update received:", update);
            setOpponentScore(update.score);
            setOpponentTotalTime(update.totalTime);
            setOpponentProgress(update.progress);

            // TIMER SYNC: Snap our local timer to match the opponent's clock
            if (update.totalTime > 0) {
                setTimeLeft(60 - update.totalTime);
            }

            // SPEED BATTLE: If opponent is ahead of us, FORCE us forward immediately
            if (update.progress > currentIndexRef.current) {
                console.log(`Opponent moved ahead to question ${update.progress + 1}. Jumping with them!`);
                if (update.progress < questionsRef.current.length) {
                    setIndex(update.progress);
                    setSelectedAnswer(null); // Clear selection for new question
                }
            }

            // SHARED FINISH: If opponent finished all, we MUST finish too
            if (update.progress === questionsRef.current.length && questionsRef.current.length > 0) {
                console.log("Opponent finished! Ending quiz immediately.");
                setIsFinished(true);
            }
        };

        socket.on('opponent_update', handleUpdate);
        socket.on('opponent_wants_rematch', () => {
            setOpponentWantsRematch(true);
        });

        socket.on('rematch_start', (newRoomId: string) => {
            console.log("Rematch starting! Moving to room:", newRoomId);
            router.push(`/quiz/battle/${newRoomId}`);
        });

        return () => {
            socket.off('opponent_update', handleUpdate);
            socket.off('opponent_wants_rematch');
            socket.off('rematch_start');
        };
    }, [roomId, socket, isConnected]);

    useEffect(() => {
        questionStartTime.current = Date.now();
    }, [index]);
    // GLOBAL TIMER EFFECT
    useEffect(() => {
        if (isFinished || timeLeft <= 0) {
            if (timeLeft <= 0 && !isFinished) setIsFinished(true);
            return;
        }
        const timerId = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, isFinished]);

    const handleAnswer = (answer: string) => {
        if (selectedAnswer || isFinished) return;

        const isCorrect = answer === questions[index].answer;
        const currentTimeSpent = 60 - timeLeft;

        const newScore = myScore + (isCorrect ? 1 : 0);
        const newProgress = index + 1;

        setSelectedAnswer(answer);
        if (isCorrect) setMyScore(s => s + 1);
        setMyTotalTime(currentTimeSpent);

        // BUFFERED SYNC: Show feedback for 600ms then move BOTH players together
        setTimeout(() => {
            socket?.emit('submit_answer', roomId, {
                score: newScore,
                totalTime: currentTimeSpent,
                progress: newProgress
            });
            handleNext(true);
        }, 600);
    };

    // Updated handleNext to handle automatic skips correctly
    const handleNext = (alreadyAnswered = false) => {
        if (isFinished) return;

        // If skip happened (timer run out or forced), we sync current state
        if (!alreadyAnswered) {
            socket?.emit('submit_answer', roomId, {
                score: myScore,
                totalTime: 60 - timeLeft,
                progress: index + 1
            });
        }

        if (index + 1 < questions.length) {
            setIndex(prev => prev + 1);
            setSelectedAnswer(null);
        } else {
            setIsFinished(true);
        }
    };

    // Save result and credit coins
    useEffect(() => {
        if (isFinished && user && questions.length > 0 && !hasSavedRef.current) {
            // Record final time if not already set by an answer
            const finalTime = 60 - timeLeft;
            setMyTotalTime(prev => prev === 0 ? finalTime : prev);

            hasSavedRef.current = true;
            setIsSaving(true);
            const saveResult = async () => {
                try {
                    const userRef = doc(db, 'users', user.uid);
                    const quizHistoryRef = collection(userRef, 'past_quizzes');
                    const earned = myScore * 5;

                    // 1. Save the detailed quiz result
                    await addDoc(quizHistoryRef, {
                        score: myScore,
                        totalQuestions: questions.length,
                        questions,
                        userAnswers: questions.map(() => null),
                        createdAt: serverTimestamp(),
                        mode: '1v1'
                    });

                    // 2. Update the user's aggregate stats
                    await updateDoc(userRef, {
                        quizzesPlayed: increment(1),
                        correctAnswers: increment(myScore),
                        totalAnswers: increment(questions.length),
                        coins: increment(earned),
                    });

                    setCoinsEarned(earned);
                } catch (err) {
                    console.error("Failed to save battle result client-side:", err);
                } finally {
                    setIsSaving(false);
                }
            };
            saveResult();
        }
    }, [isFinished, user, questions, myScore]);

    // --- Render States ---

    const handleRematch = () => {
        if (!socket || !roomId || !user) return;
        console.log("Rematch requested - room:", roomId, "user:", user.uid);
        socket.emit('request_rematch', roomId, user.uid);
        setRematchRequested(true);
    };

    if (isFinished) {
        const localWinner = myScore > opponentScore ? 'me' :
            myScore < opponentScore ? 'opponent' :
                myTotalTime < opponentTotalTime ? 'me' :
                    myTotalTime > opponentTotalTime ? 'opponent' : 'draw';

        const resultTitle = localWinner === 'me' ? 'WINNER!' : localWinner === 'opponent' ? 'DEFEATED' : 'IT\'S A DRAW';
        const resultSubtitle = localWinner === 'me' ? 'Great job! You dominated the battle.' :
            localWinner === 'opponent' ? 'Better luck next time. Your opponent was faster!' :
                'A perfect match! Both of you were equally matched.';

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
                <div className={styles['result-card']}>
                    <h1 className={styles['result-title']}>{resultTitle}</h1>
                    <p className={styles['result-subtitle']}>{resultSubtitle}</p>

                    <div className={styles['stats-grid']}>
                        <div className={styles['stat-box']}>
                            <span className={styles['stat-value']}>{myScore}</span>
                            <span className={styles['stat-label']}>Your Points</span>
                        </div>
                        <div className={`${styles['stat-box']} ${styles['stat-box-alt']}`}>
                            <span className={styles['stat-value']}>{opponentScore}</span>
                            <span className={styles['stat-label']}>Opponent Points</span>
                        </div>
                        <div className={styles['stat-box']}>
                            <span className={styles['stat-value']}>{myTotalTime.toFixed(1)}s</span>
                            <span className={styles['stat-label']}>Your Time</span>
                        </div>
                        <div className={styles['stat-box']}>
                            <span className={styles['stat-value']}>{opponentTotalTime.toFixed(1)}s</span>
                            <span className={styles['stat-label']}>Opponent Time</span>
                        </div>
                    </div>

                    <div className={styles['rewards-box']}>
                        <div className={styles['reward-info']}>
                            <span className={styles['reward-label']}>Match Rewards</span>
                            <div className={styles['reward-value']}>
                                {isSaving ? "Saving..." : `${coinsEarned} Coins`}
                            </div>
                        </div>
                        <BsAwardFill className={styles['coin-icon']} style={{ color: localWinner === 'me' ? '#fbbf24' : '#94a3b8' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                        <button
                            className={`${styles['play-again-button']} ${rematchRequested ? styles['rematch-pending'] : ''}`}
                            onClick={handleRematch}
                            disabled={rematchRequested}
                        >
                            {rematchRequested ? 'WAITING...' : opponentWantsRematch ? 'ACCEPT REMATCH?' : 'WANNA REMATCH?'}
                        </button>
                        <button
                            className={styles['home-button']}
                            onClick={() => window.location.href = '/quiz'}
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className={quizStyles.centerScreen}>
                <div className={quizStyles['matchmaking-loader']}>
                    <div className={quizStyles.spinner}></div>
                    <h2 className={quizStyles['status-text'] || lobbyStyles['status-text']}>
                        Summoning AI Battle Questions...
                    </h2>
                    <p>Preparing your 1v1 battle arena. Get ready!</p>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[index];

    return (
        <div className={styles['battle-container']}>
            <div className={styles['battle-header']}>
                {/* Live Leaderboard */}
                <div className={styles['live-leaderboard']}>
                    <div className={`${styles['leaderboard-item']} ${myScore >= opponentScore ? styles['leading'] : ''}`}>
                        <span className={styles['rank']}>{myScore >= opponentScore ? '1st' : '2nd'}</span>
                        <span className={styles['name']}>You (You)</span>
                        <span className={styles['score']}>{myScore}</span>
                    </div>
                    <div className={`${styles['leaderboard-item']} ${opponentScore > myScore ? styles['leading'] : ''}`}>
                        <span className={styles['rank']}>{opponentScore > myScore ? '1st' : '2nd'}</span>
                        <span className={styles['name']}>Opponent</span>
                        <span className={styles['score']}>{opponentScore}</span>
                    </div>
                </div>

                <div className={styles['battle-progress']}>
                    <ProgressBar current={index + 1} total={questions.length} />
                    <div className={quizStyles.timer} style={{ color: timeLeft <= 10 ? '#ef4444' : 'inherit' }}>
                        Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                    </div>
                </div>
            </div>

            {/* Opponent Mini-Progress */}
            <div className={styles['opponent-mini-stats']}>
                <p>Opponent Progress: {opponentProgress} / {questions.length}</p>
                <div className={quizStyles['progress-bar-container']} style={{ height: '4px' }}>
                    <div
                        className={quizStyles['progress-bar']}
                        style={{ width: `${(opponentProgress / questions.length) * 100}%`, backgroundColor: '#dc3545' }}
                    />
                </div>
            </div>

            {/* Question Card - Using Solo Quiz Styles */}
            <div className={quizStyles['quiz-form']}>
                <h2 className={quizStyles['quiz-question']}>
                    Q{index + 1}: {currentQuestion?.question || 'Loading question...'}
                </h2>
                <ul className={quizStyles['quiz-options']}>
                    {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                        const optionKey = `option${letter}` as keyof Question;
                        const optionValue = currentQuestion?.[optionKey] as string;

                        let btnClass = styles['option-button'];
                        if (selectedAnswer) {
                            if (optionKey === currentQuestion?.answer) btnClass += ` ${styles['correct']}`;
                            else if (optionKey === selectedAnswer) btnClass += ` ${styles['wrong']}`;
                            else btnClass += ` ${styles['disabled']}`;
                        }

                        return (
                            <li key={letter} className={styles['option-item']}>
                                <button
                                    className={btnClass}
                                    onClick={() => handleAnswer(optionKey)}
                                    disabled={!!selectedAnswer}
                                >
                                    <span className={styles['option-letter']}>{letter}</span>
                                    {optionValue}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default BattlePage;
