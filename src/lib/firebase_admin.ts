import admin from 'firebase-admin';
import serviceAccount from './service.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: "https://console.firebase.google.com/project/canonforces-a743b/database/canonforces-a743b-default-rtdb/data/~2F"
});

export const adminDb = admin.firestore();
