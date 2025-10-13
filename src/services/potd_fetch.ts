// services/potd_fetch.js

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function getPOTD() {
  console.log("--- Starting getPOTD ---");
  try {
    const snapshot = await getDocs(collection(db, 'problems'));
    console.log(`Firestore returned ${snapshot.docs.length} documents.`);

    if (snapshot.empty) {
      console.error("CRITICAL: No documents found in the 'problems' collection.");
      throw new Error('No problems found in the database.');
    }

    const problems = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => a.id.localeCompare(b.id));
    console.log("Mapped and sorted problems array:", problems);

    const referenceDate = new Date('2025-06-17'); 
    const today = new Date();
    const dayDiff = Math.floor(
      (today.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    console.log(`Day difference calculated: ${dayDiff}`);

    const problemsCount = problems.length;
    const index = ((dayDiff % problemsCount) + problemsCount) % problemsCount;
    console.log(`Calculated index: ${index} (out of ${problemsCount} problems)`);

    const selectedProblem = problems[index];
    if (!selectedProblem) {
      console.error("CRITICAL: Calculated index resulted in an undefined problem!", { index, problemsCount });
      return undefined; // Explicitly return undefined
    }

    const finalId = selectedProblem.id;
    console.log(`--- Returning final ID: ${finalId} ---`);
    return finalId;

  } catch (error) {
    console.error("!!! An error occurred inside getPOTD !!!", error);
    return undefined; // Return undefined on error
  }
}