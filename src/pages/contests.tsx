import React, { useState } from 'react';
import QuesList from '../common/components/Ques/QuesList';
import styles from '../styles/Contests.module.css'; 

const Contests = () => {
  const ratingList = ['800','900', '1000','1100', '1200','1300', '1400','1500', '1600'];
  const [rating, setRating] = useState('800');

  return (
    <div className={styles["contest-container"]}>
      <div className={styles["header-section"]}>
        <h1 className={styles["main-title"]}>Practice Arena</h1>
        <p className={styles["subtitle"]}>
          Master algorithmic problem solving with hand-picked challenges
        </p>
        <p className={styles["description"]}>
          Choose your difficulty level and dive into carefully curated problems designed to enhance your coding skills. 
          Each rating contains the most interesting and reusable concepts to accelerate your learning journey.
        </p>
      </div>

      <div className={styles["content-wrapper"]}>
        <h2 className={styles["section-title"]}>Select Difficulty Rating</h2>
        
        <div className={styles["rating-tabs"]}>
          {ratingList.map((r) => (
            <button
              key={r}
              onClick={() => setRating(r)}
              data-rating={r}
              className={`${styles["rating-button"]} ${rating === r ? styles.active : ''}`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className={styles["questions-container"]}>
          <QuesList rating={rating} />
        </div>
      </div>
    </div>
  );
};

export default Contests;