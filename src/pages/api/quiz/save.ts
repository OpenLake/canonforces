// 📁 /pages/api/quiz/save.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../lib/firebase_admin';
import { Question } from '../../../types/quiz';
import admin from 'firebase-admin';

type RequestData = {
  userId: string;
  score: number;
  totalQuestions: number;
  questions: Question[];
  userAnswers: (string | null)[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId, score, totalQuestions, questions, userAnswers }: RequestData = req.body;

  if (!userId || score === undefined || !questions) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const userRef = adminDb.collection('users').doc(userId);
    const quizHistoryRef = userRef.collection('past_quizzes').doc();
    
    // Calculate coins here to return in the response
    const coinsEarned = score * 5; // +5 coins per correct answer

    await adminDb.runTransaction(async (transaction) => {
      // 1. Save the detailed quiz result
      transaction.set(quizHistoryRef, {
        score,
        totalQuestions,
        questions,
        userAnswers,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 2. Update the user's aggregate stats
      transaction.update(userRef, {
        quizzesPlayed: admin.firestore.FieldValue.increment(1),
        correctAnswers: admin.firestore.FieldValue.increment(score),
        totalAnswers: admin.firestore.FieldValue.increment(totalQuestions),
        coins: admin.firestore.FieldValue.increment(coinsEarned),
      });
    });

    // ✅ **Return the number of coins earned in the response**
    res.status(200).json({ 
      message: 'Quiz result saved successfully!',
      coinsEarned: coinsEarned 
    });

  } catch (error) {
    console.error('Error saving quiz result:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}