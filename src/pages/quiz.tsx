import React, { useReducer, useEffect, useState, useContext } from 'react';
import styles from '../styles/Quiz.module.css';
import { QuizAction, QuizState, Question } from '../types/quiz';
import { fetchQuizQuestions } from '../services/quizClient';
import UserContext from '../context/user';
import StartScreen from '../components/quiz/StartScreen';
import QuestionDisplay from '../components/quiz/QuestionDisplay';
import ResultsScreen from '../components/quiz/ResultsScreen';
import Image from 'next/image';
import useUser from '../hooks/use-user';

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
  switch (action.type) {
    case 'START_QUIZ':
      return {
        ...state,
        status: 'loading',
        topic: action.payload.topic,
        difficulty: action.payload.difficulty,
        totalQuestions: action.payload.totalQuestions
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        status: 'active',
        questions: action.payload,
        userAnswers: new Array(action.payload.length).fill(null)
      };
    case 'FETCH_ERROR':
      return { ...state, status: 'ready', questions: [] };
    case 'ANSWER':
      const newUserAnswers = [...state.userAnswers];
      newUserAnswers[state.index] = action.payload;
      return { ...state, userAnswers: newUserAnswers };
    case 'NEXT_QUESTION':
      if (state.index < state.questions.length - 1) {
        return { ...state, index: state.index + 1 };
      }
      return state;
    case 'FINISH_QUIZ':
      let calculatedScore = 0;
      state.questions.forEach((question, i) => {
        if (question.answer === state.userAnswers[i]) calculatedScore++;
      });
      return { ...state, status: 'finished', score: calculatedScore };
    case 'RESTART':
      return { ...initialState };
    default:
      throw new Error('Unknown action type');
  }
}

async function saveQuizResult(
  userId: string,
  result: {
    score: number;
    totalQuestions: number;
    questions: Question[];
    userAnswers: (string | null)[];
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }
): Promise<number> {
  try {
    const response = await fetch('/api/quiz/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...result })
    });
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
  const { user: profileUser } = useUser();

  const handleStartQuiz = async (topic: string, difficulty: 'easy' | 'medium' | 'hard', count: number) => {
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
    if (status === 'finished' && user && questions.length > 0) {
      const saveAndSetCoins = async () => {
        const coins = await saveQuizResult(user.uid, {
          score,
          totalQuestions,
          questions,
          userAnswers,
          topic: state.topic,
          difficulty: state.difficulty,
        });
        setCoinsEarned(coins);
      };
      saveAndSetCoins();
    }
  }, [status, user, questions, userAnswers, score, totalQuestions, state.topic, state.difficulty]);

  useEffect(() => {
  }, [user]);

  return (
    <div className={`${styles['quiz-page-wrapper']} ${status === 'active' ? styles['fullscreen-mode'] : ''}`}>

      {status !== 'active' && (
        <div className={styles["header-section"]}>
          <div className={styles["header-text"]}>
            <h1 className={styles["main-title"]}>🧠 Quiz Yourself</h1>
            <p className={styles["subtitle"]}>
             Customize quizzes by topic and difficulty, compete with friends, and track your progress over time.
Take on solo challenges or real-time matches to improve your speed and accuracy. </p>
          </div>

          <div className={styles["header-image"]}>
            <Image
              src="/images/study.png"
              alt="Study illustration"
              width={350}
              height={350}
              className={styles["practice-image"]}
              priority
            />
          </div>
        </div>
      )}

      {status === 'loading' && <p className={styles.loading}>Generating your quiz...</p>}
      {status === 'ready' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Configuration */}
          <div className="lg:col-span-8">
            <div className={`${styles['premium-card']} p-7`}>
              <StartScreen onStart={handleStartQuiz} />
            </div>
          </div>

          {/* Right Column: Stats Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Career Stats Card */}
            <div className={`${styles['premium-card']} p-7`}>
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                📊 Career Insights
              </h3>
              <div className="space-y-5">
                <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Quizzes Completed</span>
                  <span className="text-lg font-bold text-blue-600">{(profileUser as any)?.quizzesPlayed || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                  <span className="text-green-600 font-medium">Correct Answers</span>
                  <span className="text-lg font-bold text-gray-900">{(profileUser as any)?.correctAnswers || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                  <span className="text-red-500 font-medium">Wrong Answers</span>
                  <span className="text-lg font-bold text-gray-900">
                    {Math.max(0, ((profileUser as any)?.totalAnswers || 0) - ((profileUser as any)?.correctAnswers || 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                  <span className="text-blue-600 font-medium">Total Accuracy</span>
                  <span className="text-lg font-bold text-gray-900">
                    {(() => {
                      const total = (profileUser as any)?.totalAnswers || 0;
                      const correct = (profileUser as any)?.correctAnswers || 0;
                      return total > 0 ? Math.round((correct / total) * 100) : 0;
                    })()}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Total Points</span>
                  <span className="text-lg font-bold text-orange-500">
                    {Math.max(0, ((profileUser as any)?.correctAnswers || 0) * 5)} XP
                  </span>
                </div>
              </div>
            </div>

            {/* Smart Insight Card */}
            <div className={`${styles['premium-card']} p-6 bg-gradient-to-br from-indigo-50/20 to-blue-50/20`}>
              <h4 className="text-blue-800 font-bold mb-2 flex items-center gap-2">
                ✨ Career Pro-Tip
              </h4>
              <p className="text-blue-600/80 text-sm leading-relaxed italic">
                {(() => {
                  const stats = profileUser as any;
                  if (!stats || !stats.quizzesPlayed) {
                    return "Welcome to your first assessment! Build your foundational knowledge and gain confidence by starting with 'Easy' mode.";
                  }
                  
                  const accuracy = stats.totalAnswers > 0 
                    ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) 
                    : 0;

                  if (stats.quizzesPlayed < 3) {
                    return "You're off to a great start! Complete a few more quizzes to unlock your personalized accuracy and streak analytics.";
                  }
                  if (accuracy > 80) {
                    return `Exceptional ${accuracy}% accuracy! Your skills are sharp. Try 'Hard' mode now to maximize your XP gains and climb the ranks.`;
                  }
                  if (accuracy < 50) {
                    return "Master the basics first! Try sticking to 'Medium' difficulty in topics like 'DSA' to stabilize your accuracy scores.";
                  }
                  if (stats.streak > 5) {
                    return `Legendary ${stats.streak}-day streak! Your consistency puts you in the top tier of developers on the platform.`;
                  }
                  return `You've completed ${stats.quizzesPlayed} quizzes with great focus. Every session refines your problem-solving speed and precision.`;
                })()}
              </p>
            </div>
          </div>
        </div>
      )}

      {status === 'active' && questions.length > 0 && (
        <div className={styles['quiz-fullscreen-container']}>
          <QuestionDisplay
            question={questions[index]}
            userAnswer={userAnswers[index]}
            questionNumber={index + 1}
            totalQuestions={questions.length}
            dispatch={dispatch}
          />
        </div>
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
