// src/types/user.ts

export interface User {
  userId: string;
  docId: string;

  // Basic profile info
  username: string;
  email: string;
  fullname?: string;
  photoURL?: string;

  // Social stats
  followers?: string[];
  following?: string[];

  // Problem solving data
  solvedQuestions?: {
    [difficulty: string]: string[]; // example: { easy: [], medium: [], hard: [] }
  };

  // Streak-related fields
  streak?: number;
  lastSolvedDate?: string; // stored from Firestore as string

  // Gamification
  coins?: number;

  // Quiz data
  quizzesPlayed?: number;
  correctAnswers?: number;
  totalAnswers?: number;

  // Metadata
  dateCreated: number;
}
