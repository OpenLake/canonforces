import React, { useState } from 'react';
import QuesList from '../common/components/Ques/QuesList';
import styles from '../styles/Contests.module.css'; 

const Contests = () => {
  const ratingList = ['800', '1000', '1200', '1400', '1600'];
  const [rating, setRating] = useState('800');

  return (
    <div className={styles["contest-container"]}>
      <div className={styles["rating-tabs"]}>
        {ratingList.map((r) => (
          <button
            key={r}
            onClick={() => setRating(r)}
            className={`rating-button ${rating === r ? 'active' : ''}`}
          >
            {r}
          </button>
        ))}
      </div>

      <QuesList rating={rating} />
    </div>
  );
};

export default Contests;
