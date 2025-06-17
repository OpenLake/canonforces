import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc
} from "firebase/firestore";
import { app } from "./firebase";

export const saveCfHandleToFirestoreByUserId = async (
  userId: string,
  username: string
) => {
  const db = getFirestore(app);


  const q = query(collection(db, "users"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
    console.log("all perfect")
  if (snapshot.empty) {
    throw new Error("No user found with this userId");
  }

  const userDoc = snapshot.docs[0].ref;

 
  await updateDoc(userDoc, {
    username: username.trim() // or cfHandle if preferred
  });
};
