// scripts/uploadProblems.ts
import { adminDb } from '../lib/firebase_admin';
import { problem } from './problems';

interface Problem {
  id: string;
  title: string;
  description: string;
  input_format: string;
  output_format: string;
  test_case: string;
  answer: string;
  solved: boolean;
}

async function uploadProblemsToFirestore(problemsByRating: { [rating: string]: Problem[] }) {
  try {
    const problemsCollection = adminDb.collection('problems');

    for (const rating in problemsByRating) {
      const problemList = problemsByRating[rating];

      for (const problem of problemList) {
        const docRef = problemsCollection.doc(problem.id);
        const docSnapshot = await docRef.get();

        if (docSnapshot.exists) {
          console.log(`⚠️ Skipping existing problem: ${problem.id}`);
          continue; 
        }

        await docRef.set({
          ...problem,
          rating: parseInt(rating),
        });
        console.log(`✅ Uploaded problem: ${problem.id}`);
      }
    }

    console.log('🎉 All new problems uploaded successfully.');
  } catch (error) {
    console.error('❌ Error uploading problems:', error);
  }
}

if (require.main === module) {
  uploadProblemsToFirestore(problem);
}
