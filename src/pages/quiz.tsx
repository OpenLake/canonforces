import React, { useState, useEffect, useRef } from 'react';
import { getGeminiModel } from "../lib/gemini";
import styles from '../styles/Quiz.module.css'; 

const Quiz: React.FC = () => {
  const [bank, setBank] = useState<Question[]>([]);
  const [questionNo, setQuestionNo] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [selected, setSelected] = useState("");

  const [score, setScore] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialQuestions: Record<number, string> = {};
  for (let i = 0; i < totalQuestions; i++) {
    initialQuestions[i] = "";
  }

  const [savedQuestions, setSavedQuestions] = useState(initialQuestions);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const model = getGeminiModel("gemini-2.5-flash");
        const result = await model.generateContent(`Generate ${totalQuestions} DSA questions following this JSON format [ {"question": "Question", "optionA": "A", "optionB": "B", "optionC": "C", "optionD": "D", "answer": "optionA"} ] without markdown code fences. `);
        const response : any = JSON.parse(result.response.text())
        setBank(response);
      } catch (err: any) {
        setError(err.message || "Could not retrieve quiz data");
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(e.target.value);
  };

  const handleNext = () => {
    const updated = { ...savedQuestions, [questionNo]: selected };
    setSavedQuestions(updated);

    if (questionNo === totalQuestions - 1) {
      let correct = 0;
      for (let i = 0; i < totalQuestions; i++) {
        if (bank[i].answer === updated[i]) correct++;
      }
      setScore(correct);
      return;
    }

    setQuestionNo(prevQ => prevQ + 1);
    setSelected(updated[questionNo + 1] || "");
  };

  const quizProps = {
    questionNo,
    totalQuestions,
    handleChange,
    handleNext,
    selected,
    bank
  };

  if (loading) {
    return (
      <div className={styles.centerScreen}>
        <p className={styles.loading}>Loading Quiz Contents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.centerScreen}>
        <p className={styles.error}>{error || "Could not retrieve quiz data"}</p>
      </div>
    );
  }

  return (
    <div className={styles["quiz-container"]}>
      <div className={styles["header-section"]}>
        <div className={styles["header-text"]}>
          <h1 className={styles["main-title"]}> 🧠Quiz Yourself</h1>
          <p className={styles["subtitle"]}>
            Test your knowledge with an AI-generated quiz
          </p>
          <p className={styles["description"]}>
            Challenge yourself with a single, interactive quiz created by AI. 
            Each question is designed to help you recall, apply, and strengthen your understanding, 
            making your learning experience focused, engaging, and effective.
          </p>
        </div>
        <div className={styles["header-image"]}>
          <img 
            src="/images/study.png" 
            alt="Practice Arena" 
            className={styles["practice-image"]}
          />
        </div>
      </div>

      { score==0 ? 
          <QuizForm 
            {...quizProps}
          />
        :
          <h1>You got {score} right out of {totalQuestions} questions!</h1>
      }
      
    </div>
  );
};

interface Question {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
}

interface QuizFormProps {
  bank: Question[];
  questionNo: number;
  totalQuestions: number;
  selected: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNext: () => void;
}

function QuizForm({ bank, questionNo, totalQuestions, selected, handleChange, handleNext }: QuizFormProps){
  return (
    <div className={styles["quiz-form"]}>
        {questionNo < totalQuestions && (
          <QuestionTimer
            questionNo={questionNo}
            duration={10}
            onTimeUp={() => handleNext()}
          />
        )}
        
        <h2 className={styles["quiz-question"]}>
          {`Q${questionNo+1}: ` + bank[questionNo]["question"]}
        </h2>

        <ul className={styles["quiz-options"]}>
          {["A", "B", "C", "D"].map((letter) => {
            const optionKey = `option${letter}` as keyof Question;
            const option = bank[questionNo][optionKey];
            return (
              <li key={letter}>
                <label>
                  <input
                    type="radio"
                    name="q"
                    value={`option${letter}`}
                    checked={selected === `option${letter}`}
                    onChange={handleChange}
                  />
                  {option}
                </label>
              </li>
            );
          })}
        </ul>

        <div className={styles["quiz-navigation"]}>

          <button
            className={`${styles["quiz-button"]} ${
              questionNo === totalQuestions - 1 ? styles.submit : ""
            }`}
            onClick={handleNext}
          >
            {questionNo !== totalQuestions - 1 ? "Next" : "Submit"}
          </button>
        </div>
      </div>
  );
};

interface QuestionTimerProps {
  questionNo: number;
  duration?: number;
  onTimeUp: () => void;
}

export const QuestionTimer = ({
  questionNo,
  duration = 5 * 60,
  onTimeUp,
}: QuestionTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  const onTimeUpRef = useRef(onTimeUp);
  const firedRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    setTimeLeft(duration);
    firedRef.current = null;

    intervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => Math.max(prev - 1, 0));
    }, 1000);

    timeoutRef.current = window.setTimeout(() => {
      if (firedRef.current === questionNo) return;
      firedRef.current = questionNo;
      onTimeUpRef.current();
    }, duration * 1000);

    // cleanup
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, [questionNo, duration]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatted = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return <div>{formatted}</div>;
};

export default Quiz;