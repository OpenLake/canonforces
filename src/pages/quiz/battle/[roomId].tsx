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
import BattleResults from '../../../components/quiz/BattleResults';
import { ToastContainer, ToastData } from '../../../components/ui/Toast';
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
    const [opponentName, setOpponentName] = useState('Opponent');
    const [myUsername, setMyUsername] = useState('You');
    const [timeLeft, setTimeLeft] = useState(60);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const questionStartTime = useRef(Date.now());
    const hasSavedRef = useRef(false);
    const currentIndexRef = useRef(0);
    const questionsRef = useRef<Question[]>([]);
    const battleStartedAtMsRef = useRef<number | null>(null);
    const battleDurationSecondsRef = useRef<number>(60);
    const finishedElapsedSecondsRef = useRef<number | null>(null);

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
        battleStartedAtMsRef.current = null;
        battleDurationSecondsRef.current = 60;
        finishedElapsedSecondsRef.current = null;
        setQuestions([]); // Triggers a fresh fetch
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

        const syncFromBattleState = (state: any) => {
            if (!state) return;
            const myId = socket.id;
            if (typeof myId !== 'string') return;
            const players = state.players || {};
            const finishedElapsedSeconds =
                typeof state.finishedElapsedSeconds === 'number' ? state.finishedElapsedSeconds : null;
            const myPlayer = players[myId] || { score: 0, totalTime: 0, progress: state.currentIndex ?? 0 };
            const opponentId = Object.keys(players).find(id => id !== myId);
            const opponentPlayer = opponentId
                ? players[opponentId]
                : {
                    score: 0,
                    // If opponent hasn't joined yet, we still want both sides' results to display
                    // the authoritative match elapsed time once `finishedElapsedSeconds` is known.
                    totalTime: state.finished && finishedElapsedSeconds !== null ? finishedElapsedSeconds : 0,
                    progress: state.currentIndex ?? 0
                };

            setMyScore(myPlayer.score ?? 0);
            setMyTotalTime(myPlayer.totalTime ?? 0);
            setOpponentScore(opponentPlayer.score ?? 0);
            setOpponentTotalTime(opponentPlayer.totalTime ?? 0);
            setOpponentProgress(state.currentIndex ?? 0);
            
            if (opponentPlayer.username) setOpponentName(opponentPlayer.username);
            if (myPlayer.username) setMyUsername(myPlayer.username);

            if (typeof state.battleStartedAtMs === 'number') {
                battleStartedAtMsRef.current = state.battleStartedAtMs;
            }
            if (typeof state.battleDurationSeconds === 'number') {
                battleDurationSecondsRef.current = state.battleDurationSeconds;
            }
            if (typeof state.finishedElapsedSeconds === 'number') {
                finishedElapsedSecondsRef.current = state.finishedElapsedSeconds;
            }
            if (battleStartedAtMsRef.current !== null) {
                const elapsedSeconds = Math.max(0, Math.floor((Date.now() - battleStartedAtMsRef.current) / 1000));
                const remaining = Math.max(0, battleDurationSecondsRef.current - elapsedSeconds);
                setTimeLeft(remaining);
            }

            const nextIndex = typeof state.currentIndex === 'number' ? state.currentIndex : 0;
            if (nextIndex !== currentIndexRef.current) {
                currentIndexRef.current = nextIndex;
                setIndex(nextIndex);
                setSelectedAnswer(null);
            }

            const questionCount = typeof state.questionCount === 'number' ? state.questionCount : questionsRef.current.length;
            if (state.finished || (questionCount > 0 && nextIndex >= questionCount)) {
                setIsFinished(true);
            }
        };

        fetch(`/api/quiz/questions/${roomId}`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                console.log("Fetched questions:", data);
                if (data.questions) setQuestions(data.questions);
                if (data.state) syncFromBattleState(data.state);
                else console.error("No questions in response data:", data);
            })
            .catch(err => console.error('Failed to fetch battle questions:', err));

        const handleBattleState = (state: any) => {
            syncFromBattleState(state);
        };
        socket.on('battle_state', handleBattleState);

        socket.on('match_found', (data: string | { roomId: string; opponentName: string }) => {
            const targetRoomId = typeof data === 'string' ? data : data.roomId;
            
            console.log(`[BATTLE] Match found! Room: ${targetRoomId}`);
            
            setToasts(prev => [...prev, {
                id: `match-${Date.now()}`,
                title: "Match Found!",
                message: `Entering battle arena...`,
                type: 'info',
                duration: 3000
            }]);

            router.push(`/quiz/battle/${targetRoomId}`);
        });

        socket.on('opponent_wants_rematch', () => {
            setOpponentWantsRematch(true);
            const newToast: ToastData = {
                id: `rematch-${Date.now()}`,
                title: "Rematch Request",
                message: `${opponentName || 'Opponent'} wants a rematch!`,
                type: 'info',
                avatar: '⚔️',
                duration: 10000,
                actions: [
                    {
                        label: "Accept",
                        type: 'primary',
                        onClick: () => {
                            if (!user) return;
                            socket.emit('request_rematch', roomId, user.uid);
                            setRematchRequested(true);
                        }
                    },
                    {
                        label: "Decline",
                        type: 'secondary',
                        onClick: () => {
                            setOpponentWantsRematch(false);
                            setToasts(prev => [...prev, {
                                id: `refused-${Date.now()}`,
                                title: "Rematch Declined",
                                type: 'info',
                                duration: 3000
                            }]);
                        }
                    }
                ]
            };
            setToasts(prev => [...prev, newToast]);
        });

        socket.on('rematch_start', (newRoomId: string) => {
            console.log("Rematch starting! Moving to room:", newRoomId);
            setToasts(prev => [...prev, {
                id: `starting-${Date.now()}`,
                title: "Match Starting",
                message: "Prepare for battle!",
                type: 'success',
                duration: 2000
            }]);
            setTimeout(() => router.push(`/quiz/battle/${newRoomId}`), 1000);
        });

        socket.on('disconnect', () => {
            setToasts(prev => [...prev, {
                id: `lost-conn-${Date.now()}`,
                title: "Connection Lost",
                message: "Reconnecting to battle...",
                type: 'error',
                duration: 5000
            }]);
        });

        return () => {
            socket.off('battle_state', handleBattleState);
            socket.off('opponent_wants_rematch');
            socket.off('rematch_start');
            socket.off('disconnect');
        };
    }, [roomId, socket, isConnected]);

    useEffect(() => {
        questionStartTime.current = Date.now();
    }, [index]);
    // GLOBAL TIMER EFFECT
    useEffect(() => {
        if (isFinished) return;

        const timerId = setInterval(() => {
            if (battleStartedAtMsRef.current === null) return;
            const elapsedSeconds = Math.max(0, Math.floor((Date.now() - battleStartedAtMsRef.current) / 1000));
            const remaining = Math.max(0, battleDurationSecondsRef.current - elapsedSeconds);
            setTimeLeft(remaining);
            if (remaining <= 0) setIsFinished(true);
        }, 250);

        return () => clearInterval(timerId);
    }, [isFinished]);

    const handleAnswer = (answer: string) => {
        if (selectedAnswer || isFinished) return;

        const isCorrect = answer === questions[index].answer;
        const battleStartedAtMs = battleStartedAtMsRef.current;
        const currentTimeSpent = battleStartedAtMs
            ? Math.floor((Date.now() - battleStartedAtMs) / 1000)
            : 0;

        const newScore = myScore + (isCorrect ? 1 : 0);
        const newProgress = index + 1;

        setSelectedAnswer(answer);
        if (isCorrect) setMyScore(s => s + 1);
        setMyTotalTime(currentTimeSpent);

        // BUFFERED SYNC: Show feedback for 600ms then move BOTH players together
        setTimeout(() => {
            socket?.emit('submit_answer', roomId, {
                questionIndex: index,
                score: newScore,
                totalTime: currentTimeSpent,
                progress: newProgress
            });
        }, 600);
    };

    // Save result and credit coins
    useEffect(() => {
        if (isFinished && user && questions.length > 0 && !hasSavedRef.current) {
            // Record final time if not already set by an answer
            const battleStartedAtMs = battleStartedAtMsRef.current;
            const fallbackFinalTime = battleStartedAtMs ? Math.floor((Date.now() - battleStartedAtMs) / 1000) : 0;

            // Prefer the per-player total time tracked from their submissions.
            // Only fall back to match elapsed time if the player never updated their time.
            const timeToShow = myTotalTime > 0 ? myTotalTime : fallbackFinalTime;
            if (timeToShow !== myTotalTime) setMyTotalTime(timeToShow);

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
    }, [isFinished, user, questions, myScore, myTotalTime]);

    // --- Render States ---

    useEffect(() => {
        if (router.query.opponentName) {
            setOpponentName(decodeURIComponent(router.query.opponentName as string));
        }
    }, [router.query.opponentName]);

    const handleRematchRequest = () => {
        if (!socket || !roomId || !user) return;
        console.log("Rematch requested - room:", roomId, "user:", user.uid);
        socket.emit('request_rematch', roomId, user.uid);
        setRematchRequested(true);
    };

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
        <>
        <div className={styles['battle-container']} style={{ filter: isFinished ? 'blur(2px) grayscale(0.3)' : 'none', opacity: isFinished ? 0.7 : 1 }}>
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
                    <ProgressBar current={Math.min(index + 1, questions.length)} total={questions.length} />
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
                    Q{Math.min(index + 1, questions.length)}: {currentQuestion?.question || (isFinished ? 'Battle Complete!' : 'Loading question...')}
                </h2>
                <ul className={quizStyles['quiz-options']}>
                    {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                        const optionKey = `option${letter}` as keyof Question;
                        const optionValue = currentQuestion?.[optionKey] as string;

                        let btnClass = styles['option-button'];
                        if (selectedAnswer || isFinished) {
                            if (optionKey === currentQuestion?.answer) btnClass += ` ${styles['correct']}`;
                            else if (optionKey === selectedAnswer) btnClass += ` ${styles['wrong']}`;
                            else btnClass += ` ${styles['disabled']}`;
                        }

                        return (
                            <li key={letter} className={styles['option-item']}>
                                <button
                                    className={btnClass}
                                    onClick={() => handleAnswer(optionKey)}
                                    disabled={!!selectedAnswer || isFinished}
                                >
                                    <span className={styles['option-letter']}>{letter}</span>
                                    {optionValue || '-'}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>

        {isFinished && (
            <BattleResults 
                myScore={myScore}
                opponentScore={opponentScore}
                myTotalTime={myTotalTime}
                opponentTotalTime={opponentTotalTime}
                coinsEarned={Math.floor(myScore * 5)}
                rematchRequested={rematchRequested}
                opponentWantsRematch={opponentWantsRematch}
                handleRematch={handleRematchRequest}
                totalQuestions={questions.length}
                isSaving={isSaving}
                myUsername={myUsername}
                opponentUsername={opponentName}
            />
        )}
        <ToastContainer toasts={toasts} setToasts={setToasts} />
        </>
    );
};

export default BattlePage;
