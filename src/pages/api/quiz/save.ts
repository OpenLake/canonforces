import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../lib/firebase_admin';
import { Question } from '../../../types/quiz';
import admin from 'firebase-admin';
import { nanoid } from 'nanoid';

type RequestData = {
  userId: string;
  score: number;
  totalQuestions: number;
  questions: Question[];
  userAnswers: (string | null)[];
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
};

const saveQuestionsToBank = async (
  questions: Question[],
  meta: { topic: string; difficulty: 'easy' | 'medium' | 'hard' }
) => {
  const bankCollection = adminDb.collection('quiz_bank');
  const batch = adminDb.batch();

  questions.forEach(q => {
    // In the future, we can pass topic/difficulty from the client to save here too
    const docId = nanoid(10); // Simple unique ID
    const docRef = bankCollection.doc(docId);
    // We use { merge: true } just in case, to avoid overwriting identical questions
    batch.set(
      docRef,
      {
        ...q,
        topic: meta.topic,
        difficulty: meta.difficulty,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });

  try {
    await batch.commit();
    console.log(`Saved ${questions.length} questions from solo quiz to bank.`);
  } catch (err) {
    console.error('Failed to save solo quiz questions to bank:', err);
  }
};


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId, score, totalQuestions, questions, userAnswers, topic, difficulty }: RequestData = req.body;

  if (!userId || score === undefined || !questions) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const userRef = adminDb.collection('users').doc(userId);
    const quizHistoryRef = userRef.collection('past_quizzes').doc();
    
    const coinsEarned = score * 5; 

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

    if (questions && questions.length > 0) {
      const safeTopic = typeof topic === 'string' && topic.trim() ? topic.trim() : 'DSA';
      const safeDifficulty: 'easy' | 'medium' | 'hard' =
        difficulty === 'easy' || difficulty === 'hard' || difficulty === 'medium' ? difficulty : 'medium';

      saveQuestionsToBank(questions, { topic: safeTopic, difficulty: safeDifficulty }).catch(console.error);
    }
    
    res.status(200).json({ 
      message: 'Quiz result saved successfully!',
      coinsEarned: coinsEarned 
    });

  } catch (error) {
    console.error('Error saving quiz result:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}