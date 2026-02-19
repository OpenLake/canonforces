// services/firebase.ts

import { signInWithPopup } from "firebase/auth";
import { auth, db, provider } from "../lib/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  limit, 
  doc, 
  updateDoc, 
  getDoc 
} from "firebase/firestore";

// --- Types ---
export interface UserProfile {
  docId: string;
  userId: string;
  username: string;
  fullname: string;
  emailAddress: string;
  following: string[];
  dateCreated: number;
  profileCompleted?: boolean;
}

// --- Auth & User Management ---

export const signupWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, provider);
    return res?.user || null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

/**
 * Checks if a Codeforces username is already taken in the Canonforces database.
 */
export async function isCanonforcesUsernameTaken(username: string): Promise<boolean> {
  const q = query(collection(db, "users"), where("username", "==", username.toLowerCase()));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

/**
 * Fetches user profile(s) from Firestore based on the userId field.
 */
export async function getUserByUserId(userId: string): Promise<UserProfile[]> {
  const q = query(collection(db, "users"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  
  const users = querySnapshot.docs.map((item) => ({
    ...item.data(),
    docId: item.id,
  }));

  return users as UserProfile[];
}

export async function updateUserProfile(docId: string, updateData: Record<string, any>) {
  const userRef = doc(db, "users", docId);
  await updateDoc(userRef, updateData);
}

export async function getAllUsers() {
  const usersSnapshot = await getDocs(collection(db, "users"));
  const users = usersSnapshot.docs.map((doc) => ({
    ...doc.data(),
    docId: doc.id,
  }));
  return users;
}

export async function getUsersByQuery(search: string, currentUserId: string) {
  if (!search.trim()) return [];

  const usersRef = collection(db, "users");

  // Query 1: username starts exactly with the typed search
  const q1 = query(
    usersRef,
    where("username", ">=", search),
    where("username", "<=", search + "\uf8ff"),
    limit(10)
  );

  // Query 2: fullname starts exactly with the typed search
  const q2 = query(
    usersRef,
    where("fullname", ">=", search),
    where("fullname", "<=", search + "\uf8ff"),
    limit(10)
  );

  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

  // Combine and remove duplicates
  const combined = [...snap1.docs, ...snap2.docs];
  const unique = Array.from(new Map(combined.map((doc) => [doc.id, doc])).values());

  // Filter out the logged-in user
  const filtered = unique.filter(doc => doc.id !== currentUserId);

  return filtered.map((doc) => ({
      docId: doc.id,
      userId: doc.data().userId,
      username: doc.data().username,
      fullname: doc.data().fullname,
      email: doc.data().emailAddress,
      dateCreated: doc.data().dateCreated,
      photoURL: doc.data().photoURL,
    }));
}

// --- Codeforces API Wrappers ---

export const doesUsernameExists = async (username: string)=> {
  try {
    const user = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
    if(user.status === 200) {
      return user.json().then((res) => {
        // console.log('Success', res)
        return res;
      });
    } else {
       console.log('API limit crossed');
       return null;
    }
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getContestCount = async (username: string) => {
  try {
    const res = await fetch(`https://codeforces.com/api/user.rating?handle=${username}`);
    if (res.status === 200) {
      const data = await res.json();
      if (data.status === "OK") {
        return data.result.length; 
      }
    }
    return 0; 
  } catch (e) {
    return 0;
  }
};

export const getSolvedCount = async (username: string) => {
  try {
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

        return { solved: solvedSet.size, attempt: data.result.length };
      }
    }
    return { solved: 0, attempt: 0 };
  } catch (e) {
    return { solved: 0, attempt: 0 };
  }
};

export const getRatingGraph = async (username: string)=>{
  try {
    const res = await fetch(`https://codeforces.com/api/user.rating?handle=${username}`);
    if (res.status === 200) {
      const data = await res.json();
      const ratings = data.result;
      const ans = [];
      for (const rating of ratings) {
        ans.push(rating.newRating);
      }
      return ans;
    }
    return [];
  } catch (e) {
    return [];
  }
};

export async function getProblemsByTags(username: string) {
  try {
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

    const sorted = Object.fromEntries(
      Object.entries(solvedTags).sort((a, b) => b[1] - a[1])
    );

    return sorted;
  } catch (e) {
    return {};
  }
}

export async function getProblemsByDifficulty(username: string) {
  try {
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
  } catch (e) {
    return {};
  }
}

export async function getContestHistory(username: string) {
  try {
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
  } catch (e) {
    return [];
  }
}

/**
 * --- NEW UNIFIED FUNCTION ---
 * Fetches User Stats for the Main Menu.
 * * Strategy: 
 * 1. Attempt to fetch fresh data from Codeforces API.
 * 2. If successful, Cache it to Firestore.
 * 3. If API fails (Limit/Error), read from Firestore 'cachedStats'.
 */
export const getOrUpdateUserStats = async (username: string, userDocId: string) => {
  try {
    // 1. Try to fetch all data from Codeforces API in parallel
    const [userInfoRes, contestCount, solveStats] = await Promise.all([
      fetch(`https://codeforces.com/api/user.info?handles=${username}`),
      getContestCount(username),
      getSolvedCount(username)
    ]);

    // 2. Validate User Info Response
    if (userInfoRes.status !== 200) {
      throw new Error("Codeforces API Error or Limit Reached");
    }
    
    const userInfoData = await userInfoRes.json();
    if (userInfoData.status !== "OK") {
        throw new Error("Codeforces User Info Failed");
    }

    const userDetails = userInfoData.result[0];

    // 3. Construct the Stats Object
    const newStats = {
      rank: userDetails.rank || "pupil",
      maxRating: userDetails.maxRating || 0,
      rating: userDetails.rating || 0,
      solved: solveStats?.solved || 0,
      attempt: solveStats?.attempt || 0,
      contestsGiven: contestCount || 0,
      lastUpdated: Date.now() 
    };

    // 4. If successful, Cache this to Firestore (Fire and Forget)
    if (userDocId) {
        const userRef = doc(db, "users", userDocId);
        // We use { merge: true } via updateDoc to avoid overwriting other fields
        await updateDoc(userRef, { cachedStats: newStats }).catch(err => console.log("Cache update failed", err)); 
    }

    return newStats;

  } catch (error) {
    console.warn("API Failed/Limit Reached. Switching to Firestore Cache.", error);

    // 5. Fallback: Fetch from Firestore
    if (!userDocId) return null;

    try {
        const userRef = doc(db, "users", userDocId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            // Return the cached stats if they exist
            if (data.cachedStats) {
                return data.cachedStats;
            }
        }
    } catch (dbError) {
        console.error("Firestore Cache fetch failed:", dbError);
    }

    return null; // No API data and no Cache data
  }
};