'use client';

import Image from "next/image";
import styles from "./User.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db, auth } from "../../../lib/firebase"; // ✅ import auth along with db
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

export default function User() {
  const router = useRouter();
  const [dbUser, setDbUser] = useState<any>(null);
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    // listen for auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthUser(firebaseUser);
      if (firebaseUser?.uid) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setDbUser(userSnap.data()); // { createdAt, emailAddress, fullname, photoURL, userId, username }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  if (!dbUser) {
    return <div>Loading user info...</div>;
  }

  const handleClick = () => {
    router.push(`/user/${dbUser.userId}`); // ✅ use Firestore's userId
  };

  return (
    <div
      className={styles.userd}
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <Image
        width={37}
        height={37}
        alt={dbUser.fullname}
        src={dbUser.photoURL || "/images/user2.jpg"} // ✅ photoURL fallback
      />
      <div className={styles.user_details}>
        <h4>{dbUser.fullname}</h4>
        <span>@{dbUser.username}</span>
      </div>
    </div>
  );
}
