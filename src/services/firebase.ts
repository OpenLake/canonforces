import { signInWithPopup } from "firebase/auth"
import { auth , provider} from "../lib/firebase"


export const doesUsernameExists = async (username: string)=> {
    const user = await fetch(`https://codeforces.com/api/user.info?handle=${username}`);
    console.log(user);
    if(user.status === 200) {
        return user;
    } else {
        return null;
    }
};