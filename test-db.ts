import { adminDb } from './src/lib/firebase_admin';

async function check() {
  try {
    const problems = await adminDb.collection('problems').limit(5).get();
    if (problems.empty) {
      console.log('No matching documents.');
      return;
    }
    problems.forEach(doc => {
      console.log(doc.id, doc.data());
    });
  } catch (err) {
    console.error('Error fetching problems:', err);
  }
}
check();
