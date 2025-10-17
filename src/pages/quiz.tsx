import React, { useReducer, useEffect, useState, useContext } from 'react';
import styles from '../styles/Quiz.module.css';
import { QuizAction, QuizState, Question } from '../types/quiz';
import { fetchQuizQuestions } from '../services/quizService';
import UserContext from '../context/user'; // Using your preferred context
import StartScreen from '../components/quiz/StartScreen';
import QuestionDisplay from '../components/quiz/QuestionDisplay';
import ResultsScreen from '../components/quiz/ResultsScreen';

const initialState: QuizState = {
  status: 'ready',
  questions: [],
  index: 0,
  userAnswers: [],
  score: 0,
  topic: 'DSA',
  difficulty: 'medium',
  totalQuestions: 5,
};

function reducer(state: QuizState, action: QuizAction): QuizState {
  // This function remains unchanged
  switch (action.type) {
    case 'START_QUIZ': return { ...state, status: 'loading', topic: action.payload.topic, difficulty: action.payload.difficulty, totalQuestions: action.payload.totalQuestions };
    case 'FETCH_SUCCESS': return { ...state, status: 'active', questions: action.payload, userAnswers: new Array(action.payload.length).fill(null) };
    case 'FETCH_ERROR': return { ...state, status: 'ready', questions: [] };
    case 'ANSWER': const newUserAnswers = [...state.userAnswers]; newUserAnswers[state.index] = action.payload; return { ...state, userAnswers: newUserAnswers };
    case 'NEXT_QUESTION': if (state.index < state.questions.length - 1) { return { ...state, index: state.index + 1 }; } return state;
    case 'FINISH_QUIZ': let calculatedScore = 0; state.questions.forEach((question, i) => { if (question.answer === state.userAnswers[i]) { calculatedScore++; } }); return { ...state, status: 'finished', score: calculatedScore };
    case 'RESTART': return { ...initialState };
    default: throw new Error('Unknown action type');
  }
}

async function saveQuizResult(
  userId: string,
  result: { score: number; totalQuestions: number; questions: Question[]; userAnswers: (string | null)[] }
): Promise<number> {
    // This function remains unchanged
    try {
        const response = await fetch('/api/quiz/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, ...result }) });
        if (!response.ok) throw new Error('Failed to save quiz result');
        const data = await response.json();
        return data.coinsEarned || 0;
    } catch (error) {
        console.error("Couldn't save quiz result:", error);
        return 0;
    }
}

const QuizPage: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { status, questions, index, userAnswers, score, totalQuestions } = state;
  const [coinsEarned, setCoinsEarned] = useState(0);
  const user = useContext(UserContext);

  const handleStartQuiz = async (topic: string, difficulty: 'easy' | 'medium' | 'hard', count: number) => {
    // This function remains unchanged
    dispatch({ type: 'START_QUIZ', payload: { topic, difficulty, totalQuestions: count } });
    try {
        const fetchedQuestions = await fetchQuizQuestions(topic, difficulty, count);
        dispatch({ type: 'FETCH_SUCCESS', payload: fetchedQuestions });
    } catch (error) {
        console.error(error);
        dispatch({ type: 'FETCH_ERROR' });
    }
  };

  useEffect(() => {
    // This effect remains unchanged
    if (status === 'finished' && user && questions.length > 0) {
      const saveAndSetCoins = async () => {
        const coins = await saveQuizResult(user.uid, { score, totalQuestions, questions, userAnswers });
        setCoinsEarned(coins);
      };
      saveAndSetCoins();
    }
  }, [status, user, questions, userAnswers, score, totalQuestions]);

  return (
    <div className={styles['quiz-page-wrapper']}>
      {/* 👇 This is the header section, now restored to the main page layout 👇 */}
      <div className={styles["header-section"]}>
        <div className={styles["header-text"]}>
          <h1 className={styles["main-title"]}> 🧠 Quiz Yourself</h1>
          <p className={styles["subtitle"]}>Test your knowledge with an AI-generated quiz</p>
        </div>
        <div className={styles["header-image"]}>
          <img src="/images/study.png" alt="Study illustration" className={styles["practice-image"]} />
        </div>
      </div>

      {/* The rest of the page logic correctly renders the right component below the header */}
      {status === 'loading' && <p className={styles.loading}>Generating your quiz...</p>}
      
      {status === 'ready' && <StartScreen onStart={handleStartQuiz} />}

      {status === 'active' && questions.length > 0 && (
        <QuestionDisplay
          question={questions[index]}
          userAnswer={userAnswers[index]}
          questionNumber={index + 1}
          totalQuestions={questions.length}
          dispatch={dispatch}
        />
      )}

      {status === 'finished' && (
        <ResultsScreen
          score={score}
          totalQuestions={questions.length}
          questions={questions}
          userAnswers={userAnswers}
          dispatch={dispatch}
          coinsEarned={coinsEarned}
        />
      )}
    </div>
  );
};

export default QuizPage;
