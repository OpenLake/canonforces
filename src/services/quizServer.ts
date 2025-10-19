import { adminDb } from "../lib/firebase_admin";
import { Question } from "../types/quiz";
import { nanoid } from 'nanoid';
// We use the same client-side function, but it's okay
// because this file is ONLY imported on the server.
import { fetchQuizQuestions } from "./quizClient"; 

async function generateAndSaveQuestions(
  topic: string,
  difficulty: "easy" | "medium" | "hard",
  count: number
): Promise<Question[]> {
  const questions = await fetchQuizQuestions(topic, difficulty, count);
  
  const bankCollection = adminDb.collection('quiz_bank');
  const batch = adminDb.batch();

  questions.forEach(q => {
    const docId = nanoid(10); 
    const docRef = bankCollection.doc(docId);
    batch.set(docRef, { ...q, topic, difficulty });
  });
  
  await batch.commit();
  console.log(`Saved ${questions.length} new questions to the bank.`);
  return questions;
}

// This is the main function our server will use
export async function getBankedQuestions(
  topic: string,
  difficulty: "easy" | "medium" | "hard",
  count: number
): Promise<Question[]> {
  
  const bankRef = adminDb.collection('quiz_bank')
    .where('topic', '==', topic)
    .where('difficulty', '==', difficulty);

  try {
    const snapshot = await bankRef.get();
    
    if (snapshot.empty) {
      return generateAndSaveQuestions(topic, difficulty, count);
    }

    const allQuestions = snapshot.docs.map(doc => doc.data() as Question);
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    if (selected.length < count) {
      const needed = count - selected.length;
      const newQuestions = await generateAndSaveQuestions(topic, difficulty, needed);
      return [...selected, ...newQuestions];
    }

    console.log(`Successfully fetched ${count} questions from bank.`);
    return selected;

  } catch (err) {
    console.error("Error getting banked questions:", err);
    return generateAndSaveQuestions(topic, difficulty, count); // Fallback
  }
}