// src/types/user.ts

export interface User {
  userId: string;
  docId: string;
  username: string;
  email: string;
  fullname?: string;
  photoURL?: string;
  followers?: string[];
  following?: string[];
  solvedQuestions?: string[];
  dateCreated: number; // Using number for timestamp is common
}