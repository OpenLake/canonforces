import { signInWithPopup } from "firebase/auth";
import { auth, db, provider } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { User } from "../types/user";

export const signupWithGoogle = async () => {
    signInWithPopup(auth, provider)
    .then(res => {
        if(res) {
            return res.user;
        } else {
            return null;
        }
    })
    .catch(err => {
        console.error(err);
    })
}

export const doesUsernameExists = async (username: string)=> {
    const user = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
    if(user.status === 200) {
        return user.json().then((res) => {
            return res;
        });
    } else {
        return null;
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
