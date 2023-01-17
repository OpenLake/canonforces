import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../lib/firebase";

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
    console.log(user);
    if(user.status === 200) {
        return user;
    } else {
        return null;
    }
};