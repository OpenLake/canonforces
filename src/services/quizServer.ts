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
const TOPIC_MAP: Record<string, string> = {
  "Data Structures and Algorithms": "DSA",
  "Computer Science Fundamentals": "CS Fundamentals",
  "System Design": "System Design",
  "JavaScript": "JavaScript"
};

export async function getBankedQuestions(
  topic: string,
  difficulty: "easy" | "medium" | "hard",
  count: number
): Promise<Question[]> {

  try {
    console.log(`[QUIZ_SERVER] --- Starting Quiz Retrieval ---`);
    console.log(`[QUIZ_SERVER] Topic: "${topic}", Difficulty: "${difficulty}", Requested Count: ${count}`);

    if (!db) {
      console.error("[QUIZ_SERVER] ERROR: Firestore 'db' object is undefined.");
    }

    // List of topics to try from the bank
    const topicsToTry = [topic];
    // Add legacy full names if short name is passed, or vice versa
    if (topic === 'DSA') topicsToTry.push('Data Structures and Algorithms');
    if (topic === 'Data Structures and Algorithms') topicsToTry.push('DSA');

    for (const t of Array.from(new Set(topicsToTry))) {
      console.log(`[QUIZ_SERVER] Checking bank for topic: "${t}"`);
      const bankRef = query(
        collection(db, 'quiz_bank'),
        where('topic', '==', t),
        where('difficulty', '==', difficulty)
      );

      const snapshot = await getDocs(bankRef);
      const bankedQuestions = snapshot.docs.map(doc => doc.data() as Question);
      
      if (bankedQuestions.length >= count) {
        console.log(`[QUIZ_SERVER] SUCCESS: Found sufficient questions in bank for "${t}" (${bankedQuestions.length}).`);
        const shuffled = [...bankedQuestions].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
      }
    }

    // 2. If not enough questions in any bank variant, call the AI
    console.log(`[QUIZ_SERVER] Insufficient bank. Calling AI for "${topic}"...`);
    try {
      const questions = await generateAndSaveQuestions(topic, difficulty, count);
      if (questions && questions.length > 0) {
        console.log(`[QUIZ_SERVER] SUCCESS: Generated ${questions.length} AI questions.`);
        return questions;
      }
    } catch (aiErr) {
      console.error(`[QUIZ_SERVER] AI GENERATION FAILED:`, aiErr);
    }

    // 3. Last chance fallback to anything we found in the bank
    for (const t of topicsToTry) {
        const bankRef = query(collection(db, 'quiz_bank'), where('topic', '==', t), where('difficulty', '==', difficulty));
        const snap = await getDocs(bankRef);
        if (snap.docs.length > 0) {
            console.log(`[QUIZ_SERVER] Falling back to partial bank (${snap.docs.length}) for "${t}".`);
            const banked = snap.docs.map(doc => doc.data() as Question);
            const shuffled = [...banked].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, Math.min(banked.length, count));
        }
    }

    throw new Error(`Everything failed for ${topic}/${difficulty}`);

  } catch (err) {
    console.error(`[QUIZ_SERVER] TOP-LEVEL FAILURE:`, err);
    return [];
  }
}