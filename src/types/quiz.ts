// 📁 /types/quiz.ts

export interface Question {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string; // "optionA", "optionB", etc.
}

export type QuizState = {
  status: "loading" | "ready" | "active" | "finished";
  questions: Question[];
  index: number; // Current question index
  userAnswers: (string | null)[];
  score: number;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  totalQuestions: number;
};

export type QuizAction =
  | { type: "FETCH_SUCCESS"; payload: Question[] }
  | { type: "FETCH_ERROR" }
  | { type: "START_QUIZ"; payload: { topic: string; difficulty: "easy" | "medium" | "hard"; totalQuestions: number } }
  | { type: "ANSWER"; payload: string }
  | { type: "NEXT_QUESTION" }
  | { type: "FINISH_QUIZ" }
  | { type: "RESTART" };