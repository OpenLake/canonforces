import { useRouter } from 'next/router';
import React, { useState, useEffect, useContext } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { Question } from '../../../types/quiz';
import styles from '../../../styles/Battle.module.css';

const OpponentProgress = ({ index, total }: { index: number, total: number }) => {
  return (
    <div className={styles['opponent-progress']}>
      <p>Opponent Progress: {index + 1} / {total}</p>
      <div className={styles['progress-bar-container']}>
        <div 
          className={styles['progress-bar']} 
          style={{ width: `${((index + 1) / total) * 100}%` }} 
        />
      </div>
    </div>
  );
};

const BattleScore = ({ myScore, opScore }: { myScore: number, opScore: number }) => (
  <div className={styles['battle-score']}>
    <div className={styles['score-panel']}>
      <span>You</span>
      <span className={styles['score-value']}>{myScore}</span>
    </div>
    <div className={`${styles['score-panel']} ${styles.opponent}`}>
      <span>Opponent</span>
      <span className={styles['score-value']}>{opScore}</span>
    </div>
  </div>
);

const BattlePage = () => {
  const router = useRouter();
  const { battleId } = router.query;
  const { socket, isConnected } = useSocket();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [opScore, setOpScore] = useState(0);
  const [opIndex, setOpIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [status, setStatus] = useState('loading');
  const [opReady, setOpReady] = useState(false);

  useEffect(() => {
    if (!battleId || !socket || !isConnected) return;

    const fetchBattleQuestions = async () => {
      try {
        const res = await fetch(`/api/quiz/battle/getQuestions?battleId=${battleId}`);
        if (!res.ok) throw new Error('Battle not found');
        const data = await res.json();
        setQuestions(data.questions);
        setStatus('waiting');
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    };

    fetchBattleQuestions();
    socket.emit('join_battle_room', battleId);

    socket.on('opponent_ready', () => {
      setOpReady(true);
      if (status === 'waiting') {
        setStatus('active');
      }
    });

    socket.on('opponent_answered', (isCorrect: boolean) => {
      if (isCorrect) setOpScore(s => s + 1);
    });

    socket.on('opponent_moved_to_next', (newIndex: number) => {
      setOpIndex(newIndex);
    });
    
    return () => {
      socket.off('opponent_ready');
      socket.off('opponent_answered');
      socket.off('opponent_moved_to_next');
    };
  }, [battleId, socket, isConnected, status, router]);

  const handleSelect = (optionKey: string) => {
    if (isAnswered) return;
    setSelected(optionKey);
  };

  const handleSubmit = () => {
    if (!selected || !socket) return;
    setIsAnswered(true);
    const currentQuestion = questions[index];
    const isCorrect = currentQuestion.answer === selected;
    if (isCorrect) {
      setMyScore(s => s + 1);
    }
    socket.emit('submit_answer', battleId, isCorrect);
  };

  const handleNext = () => {
    if (!socket) return;
    const nextIndex = index + 1;
    if (nextIndex < questions.length) {
      setIndex(nextIndex);
      setOpIndex(nextIndex);
      setSelected(null);
      setIsAnswered(false);
      socket.emit('next_question', battleId, nextIndex);
    } else {
      setStatus('finished');
    }
  };
  
  if (status === 'loading') {
    return <div className={styles['battle-container']}><p>Loading Battle...</p></div>;
  }
  if (status === 'error') {
    return <div className={styles['battle-container']}><p>Error loading battle. It may have expired.</p></div>;
  }
  if (status === 'waiting' && !opReady) {
    return <div className={styles['battle-container']}><p>Waiting for opponent to connect...</p></div>;
  }
  if (status === 'finished') {
    return (
      <div className={styles['battle-container']}>
        <div className={styles['battle-results']}>
          <h2>Battle Over!</h2>
          {myScore > opScore && <h3>You Won! 🎉</h3>}
          {myScore < opScore && <h3>You Lost... 😥</h3>}
          {myScore === opScore && <h3>It&apos;s a Draw! 🤝</h3>}
          <BattleScore myScore={myScore} opScore={opScore} />
          <button onClick={() => router.push('/quiz')} className={styles['battle-button']}>
            Back to Quiz Home
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[index];
  if (!currentQuestion) {
     return <div className={styles['battle-container']}><p>Waiting for questions...</p></div>;
  }

  return (
    <div className={styles['battle-container']}>
      <BattleScore myScore={myScore} opScore={opScore} />
      <OpponentProgress index={opIndex} total={questions.length} />

      <div className={styles['battle-question-card']}>
        <h2 className={styles['battle-question']}>
          {`Q${index + 1}: ${currentQuestion.question}`}
        </h2>

        <ul className={styles['battle-options']}>
          {['A', 'B', 'C', 'D'].map((letter) => {
            const optionKey = `option${letter}` as keyof Question;
            let btnClass = styles['option-button'];
            if (isAnswered) {
              if (currentQuestion.answer === optionKey) {
                btnClass += ` ${styles.correct}`;
              } else if (selected === optionKey) {
                btnClass += ` ${styles.wrong}`;
              } else {
                btnClass += ` ${styles.disabled}`;
              }
            } else if (selected === optionKey) {
              btnClass += ` ${styles.selected}`;
            }

            return (
              <li key={letter}>
                <button
                  onClick={() => handleSelect(optionKey)}
                  className={btnClass}
                  disabled={isAnswered}
                >
                  {currentQuestion[optionKey]}
                </button>
              </li>
            );
          })}
        </ul>

        {isAnswered ? (
          <button onClick={handleNext} className={styles['battle-button']}>
            {index === questions.length - 1 ? 'Finish' : 'Next'}
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={!selected} className={styles['battle-button']}>
            Submit Answer
          </button>
        )}
      </div>
    </div>
  );
};

export default BattlePage;
