import { signInWithPopup } from "firebase/auth";
import { auth, db, provider } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { User } from "../types/user";
// services/firebase.js

// ... your other functions like doesUsernameExists, getUserByUserId

/**
 * Checks if a Codeforces username is already taken in the Canonforces database.
  * Checks if a Codeforces username is already taken in the Canonforces database.
 * @param {string} username The Codeforces username to check.
 * @returns {Promise<boolean>} True if the username is already taken, false otherwise.
 */
export async function isCanonforcesUsernameTaken(username: string): Promise<boolean> {
    const q = query(collection(db, "users"), where("username", "==", username.toLowerCase()));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
}
export const signupWithGoogle = async () => {
    try {
        const res = await signInWithPopup(auth, provider);
        return res?.user || null;
    } catch (err) {
        console.error(err);
        return null;
    }
};


export const doesUsernameExists = async (username: string)=> {
    const user = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
    if(user.status === 200) {
        return user.json().then((res) => {
            console.log('Success',res)
            return res;
        });
    } else {
       console.log('APi limit crossed');
    }
};


// Add this function to your services/firebase.js
export async function updateUserProfile(docId: string, updateData: Record<string, any>) {
  const userRef = doc(db, "users", docId);
  await updateDoc(userRef, updateData);
}
import { doc, updateDoc } from "firebase/firestore";
export interface UserProfile {
    docId: string;
    userId: string;
    username: string;
    fullname: string;
    emailAddress: string;
    following: string[];
    dateCreated: number;
}

/**
 * Fetches user profile(s) from Firestore based on the userId field.
 * NOTE: This function queries a field. A more efficient pattern for unique users
 * is to fetch a document directly by its ID.
 * @param {string} userId The user's auth UID.
 * @returns {Promise<UserProfile[]>} An array of user profiles that match the UID.
 */
export async function getUserByUserId(userId: string): Promise<UserProfile[]> {
    const q = query(collection(db, "users"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const users = querySnapshot.docs.map((item) => ({
        ...item.data(),
        docId: item.id,
    }));

    // 2. We cast the returned array to our UserProfile type to ensure type safety.
    return users as UserProfile[];
}


export const getContestCount = async (username: string) => {
    const res = await fetch(`https://codeforces.com/api/user.rating?handle=${username}`);
    if (res.status === 200) {
        const data = await res.json();
        if (data.status === "OK") {
            return data.result.length; 
        }
    }
    return 0; 
};


export const getSolvedCount = async (username: string) => {
  const res = await fetch(`https://codeforces.com/api/user.status?handle=${username}`);
  if (res.status === 200) {
    const data = await res.json();
    if (data.status === "OK") {
      const solvedSet = new Set();
        
      for (const submission of data.result) {
        if (submission.verdict === "OK") {
          const problemId = `${submission.problem.contestId}-${submission.problem.index}`;
          solvedSet.add(problemId);
        }
      }

      return {solved:solvedSet.size,attempt:data.result.length};
    }
  }
  return 0;
};


export const getRatingGraph = async (username: string)=>{
    const res=await fetch(`https://codeforces.com/api/user.rating?handle=${username}`)
    if (res.status===200){
        const data=await res.json()
        const ratings=data.result
        const ans =[]
        for (const rating of ratings){
                ans.push(rating.newRating)
        }
        return ans
    }
    return []
}


export async function getAllUsers() {
  const usersSnapshot = await getDocs(collection(db, "users"));
  const users = usersSnapshot.docs.map((doc) => ({
    ...doc.data(),
    docId: doc.id,
  }));
  return users;
}

// services/firebase.ts (or services/codeforces.ts if separate)

export async function getProblemsByTags(username: string) {
  const res = await fetch(`https://codeforces.com/api/user.status?handle=${username}`);
  const data = await res.json();
  if (data.status !== 'OK') return {};

  const solvedTags: Record<string, number> = {};

  data.result.forEach((submission: any) => {
    if (submission.verdict === 'OK') {
      submission.problem.tags.forEach((tag: string) => {
        solvedTags[tag] = (solvedTags[tag] || 0) + 1;
      });
    }
  });

  // Sort by highest solved first
  const sorted = Object.fromEntries(
    Object.entries(solvedTags).sort((a, b) => b[1] - a[1])
  );

  return sorted;
}


export async function getProblemsByDifficulty(username: string) {
  const res = await fetch(`https://codeforces.com/api/user.status?handle=${username}`);
  const data = await res.json();
  if (data.status !== 'OK') return {};

  const difficultyBuckets: Record<string, number> = {
    "<800": 0,
    "800-1200": 0,
    "1200-1600": 0,
    "1600-2000": 0,
    "2000+": 0
  };

  data.result.forEach((submission: any) => {
    if (submission.verdict === 'OK' && submission.problem.rating) {
      const r = submission.problem.rating;
      if (r < 800) difficultyBuckets["<800"]++;
      else if (r < 1200) difficultyBuckets["800-1200"]++;
      else if (r < 1600) difficultyBuckets["1200-1600"]++;
      else if (r < 2000) difficultyBuckets["1600-2000"]++;
      else difficultyBuckets["2000+"]++;
    }
  });

  return difficultyBuckets;
}


export async function getContestHistory(username: string) {
  const res = await fetch(`https://codeforces.com/api/user.rating?handle=${username}`);
  const data = await res.json();
  if (data.status !== 'OK') return [];

  const contests = data.result.map((c: any) => ({
    contestName: c.contestName,
    gain: c.newRating - c.oldRating,
    newRating: c.newRating,
    rank: c.rank,
  }));

  return contests;
}
