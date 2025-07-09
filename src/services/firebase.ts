import { signInWithPopup } from "firebase/auth";
import { auth, db, provider } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { User } from "../types/user";

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



export async function getUserByUserId(userId: string) {
    const q = query(collection(db, "users"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const user = querySnapshot.docs.map((item) => ({
        ...item.data(),
        docId: item.id,
    }));

    return user;    
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