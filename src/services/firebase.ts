import { signInWithPopup } from "firebase/auth"
import { auth , provider} from "../lib/firebase"
import { useRouter } from "next/router"


export const signupWithGoogle = (username: string) => {
    const router = useRouter();

    if(username !== '') {
        signInWithPopup(auth, provider)
        .then((res) => {
            router.push("/login/username");
            
        })
        .catch((err) => {
            // handle error
            console.error(err.message);
        })
    } else {
        return "Username does not exists!";
    }
}

signupWithGoogle.getInitialProps = async (ctx) => {
    const user = await fetch(`https://codeforces.com/api/user.info?handle=${username}`);
    console.log(user);
};