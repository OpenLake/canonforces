import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function getPOTD() {
  const snapshot = await getDocs(collection(db, 'problems'));

  const problems = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => a.id.localeCompare(b.id));

  if (problems.length === 0) {
    throw new Error('No problems found');
  }

  const referenceDate = new Date('2025-06-17'); 
  const today = new Date();
  const dayDiff = Math.floor(
    (today.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const index = dayDiff % problems.length;
  return problems[index].id; 
}
