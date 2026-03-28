import { db } from "../lib/firebase";
import { collection, query, where, getDocs, writeBatch, doc } from "firebase/firestore";
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

  const bankCollection = collection(db, 'quiz_bank');
  const batch = writeBatch(db);

  questions.forEach(q => {
    const docRef = doc(bankCollection, nanoid(10));
    batch.set(docRef, { ...q, topic, difficulty, createdAt: new Date().toISOString() });
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

  const bankRef = query(
    collection(db, 'quiz_bank'),
    where('topic', '==', topic),
    where('difficulty', '==', difficulty)
  );

  try {
    console.log(`[QUIZ_SERVER] Requesting ${count} questions for ${topic}/${difficulty}`);

    // Call the AI directly
    const questions = await generateAndSaveQuestions(topic, difficulty, count);

    if (questions && questions.length > 0) {
      console.log(`[QUIZ_SERVER] SUCCESS: Generated ${questions.length} AI questions.`);
      return questions;
    }

    console.warn(`[QUIZ_SERVER] AI returned empty array. This happens if the prompt is rejected.`);
    throw new Error("AI returned no questions");

  } catch (err) {
    console.error(`[QUIZ_SERVER] AI Generation failed:`, err instanceof Error ? err.message : err);
    console.log(`[QUIZ_SERVER] Falling back to database bank for ${topic}/${difficulty}...`);

    try {
      const snapshot = await getDocs(bankRef);
      const bankedQuestions = snapshot.docs.map(doc => doc.data() as Question);

      if (bankedQuestions.length === 0) {
        console.error(`[QUIZ_SERVER] DATABASE ALSO EMPTY for ${topic}/${difficulty}.`);
        return [];
      }

      console.log(`[QUIZ_SERVER] SUCCESS: Fetched ${bankedQuestions.length} from bank. Shuffling...`);
      const shuffled = [...bankedQuestions].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    } catch (fallbackErr) {
      console.error("[QUIZ_SERVER] Full failure (AI + Bank):", fallbackErr);
      return [];
    }
  }
}