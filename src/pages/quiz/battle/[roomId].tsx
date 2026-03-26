import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { useSocket } from '../../../context/SocketContext';
import UserContext from '../../../context/user';
import styles from '../../../styles/Battle.module.css';

interface Question {
    question: string;
    options: string[];
    answer: string;
}

const BattlePage = () => {
    const router = useRouter();
    const { roomId } = router.query;
    const { socket, isConnected } = useSocket();
    const user = useContext(UserContext);

    const [questions, setQuestions] = useState<Question[]>([]);
    const [index, setIndex] = useState(0);
    const [myScore, setMyScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [opponentProgress, setOpponentProgress] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isFinished, setIsFinished] = useState(false);

        // 1. Fetch questions and join the battle room
    useEffect(() => {
        if (!roomId || !socket || !isConnected) return;

        console.log("Joining battle room:", roomId);
        // Join the socket room so you receive opponent updates
        socket.emit('join_battle', roomId as string);

        // Fetch the questions from the server
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

        // Listen for opponent answering a question
        socket.on('opponent_update', ({ isCorrect }: { isCorrect: boolean }) => {
            if (isCorrect) setOpponentScore(prev => prev + 1);
            setOpponentProgress(prev => prev + 1);
        });

        return () => {
            socket.off('opponent_update');
        };
    }, [roomId, socket]);

    const handleAnswer = (option: string) => {
        if (selectedAnswer) return; // Already answered this question
        setSelectedAnswer(option);

        const currentQuestion = questions[index];
        const isCorrect = option === currentQuestion.answer;

        if (isCorrect) setMyScore(prev => prev + 1);

        // Tell the opponent how you did
        socket?.emit('submit_answer', roomId, isCorrect);

        // Wait 1 second then move to next question
        setTimeout(() => {
            if (index + 1 < questions.length) {
                setIndex(prev => prev + 1);
                setSelectedAnswer(null);
            } else {
                setIsFinished(true);
            }
        }, 1000);
    };

    // --- Render States ---

    if (isFinished) {
        const iWon = myScore > opponentScore;
        const isDraw = myScore === opponentScore;
        return (
            <div className={styles['battle-container']}>
                <div className={styles['battle-results']}>
                    <h2>{iWon ? '🏆 You Won!' : isDraw ? '🤝 It\'s a Draw!' : '💀 You Lost'}</h2>
                    <h3>Your Score: {myScore} / {questions.length}</h3>
                    <h3>Opponent: {opponentScore} / {questions.length}</h3>
                    <button className={styles['battle-button']} onClick={() => router.push('/quiz')}>
                        Play Again
                    </button>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return <div className={styles['battle-container']}><p>Loading battle...</p></div>;
    }

    const currentQuestion = questions[index];

    return (
        <div className={styles['battle-container']}>
            {/* Scoreboard */}
            <div className={styles['battle-score']}>
                <div className={styles['score-panel']}>
                    <span>You</span>
                    <span className={styles['score-value']}>{myScore}</span>
                </div>
                <div className={`${styles['score-panel']} ${styles['opponent']}`}>
                    <span>Opponent</span>
                    <span className={styles['score-value']}>{opponentScore}</span>
                </div>
            </div>

            {/* Opponent Progress */}
            <div className={styles['opponent-progress']}>
                <p>Opponent answered {opponentProgress} / {questions.length}</p>
                <div className={styles['progress-bar-container']}>
                    <div
                        className={styles['progress-bar']}
                        style={{ width: `${(opponentProgress / questions.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <div className={styles['battle-question-card']}>
                <p className={styles['battle-question']}>
                    Q{index + 1}: {currentQuestion?.question || 'Loading question...'}
                </p>
                <ul className={styles['battle-options']}>
                    {currentQuestion?.options?.map((option) => {
                        let btnClass = styles['option-button'];
                        if (selectedAnswer) {
                            if (option === currentQuestion.answer) btnClass += ` ${styles['correct']}`;
                            else if (option === selectedAnswer) btnClass += ` ${styles['wrong']}`;
                            else btnClass += ` ${styles['disabled']}`;
                        }
                        return (
                            <li key={option}>
                                <button
                                    className={btnClass}
                                    onClick={() => handleAnswer(option)}
                                    disabled={!!selectedAnswer}
                                >
                                    {option}
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
