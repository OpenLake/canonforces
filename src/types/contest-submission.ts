// src/types/contest-submission.ts

export interface ContestSubmission {
  id?: string;
  userId: string;
  contestId: string;
  problemId: string;
  problemName: string;
  platform: string;
  language: string;
  code: string;
  submittedAt: Date | any;
  coinsEarned: number;
}

export interface PastContest {
  platform: string;
  contestName: string;
  contestLink: string;
  contestId: string;
  endTime: number;
}

export interface ContestProblem {
  problemId: string;
  problemName: string;
  problemIndex: string; // e.g., "A", "B", "C"
  contestId: string;
  contestName: string;
  platform: string;
  problemLink?: string; // Direct link to the problem
  difficulty?: string;
  tags?: string[];
}

export const SUPPORTED_LANGUAGES = [
  'C++',
  'Python',
  'Java',
  'JavaScript',
  'C',
  'C#',
  'Go',
  'Rust',
  'Kotlin',
  'Swift',
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
