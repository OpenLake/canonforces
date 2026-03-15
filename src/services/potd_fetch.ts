// services/potd_fetch.ts

import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Returns today's date in YYYY-MM-DD using LOCAL timezone (matches HTML date inputs)
function getLocalDateString(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export async function getPOTD() {
  console.log("--- Starting getPOTD ---");
  try {
    // Check if there is a manual schedule for today
    let scheduledProblemId = null;
    try {
      const todayDate = getLocalDateString();
      const scheduleRef = doc(db, 'potd_schedule', todayDate);
      const scheduleSnap = await getDoc(scheduleRef);
      if (scheduleSnap.exists()) {
        const scheduledData = scheduleSnap.data();
        if (scheduledData && scheduledData.problemId) {
          scheduledProblemId = scheduledData.problemId;
        }
      }
    } catch (schedErr) {
      console.warn("Failed to fetch potd_schedule, falling back to random:", schedErr);
    }

    if (scheduledProblemId) {
      // Validate that the scheduled problem actually exists in the problems collection
      try {
        const problemRef = doc(db, 'problems', scheduledProblemId);
        const problemSnap = await getDoc(problemRef);
        if (problemSnap.exists()) {
          console.log(`--- Returning scheduled final ID: ${scheduledProblemId} ---`);
          return scheduledProblemId;
        } else {
          console.warn(`Scheduled problem "${scheduledProblemId}" not found in problems collection. Falling back to random.`);
        }
      } catch (validationErr) {
        console.warn("Failed to validate scheduled problem, falling back to random:", validationErr);
      }
    }

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