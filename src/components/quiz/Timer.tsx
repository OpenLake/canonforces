import React, { useState, useEffect } from 'react';
import styles from '../../styles/Quiz.module.css';

interface Props {
  duration: number; // Duration in seconds
  onTimeUp: () => void;
}

const Timer: React.FC<Props> = ({ duration, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    // Exit early if time is up
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    // Set up the interval
    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    // Clean up the interval on component unmount or when dependencies change
    return () => clearInterval(intervalId);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Add a warning class when time is low
  const timerClassName = `${styles.timer} ${timeLeft <= 10 ? styles.warning : ''}`;

  return (
    <div className={timerClassName}>
      Time Left: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
};

export default Timer;