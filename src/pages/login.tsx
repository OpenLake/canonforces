import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import styles from "../styles/Login.module.css";
import * as ROUTES from "../constants/routes";
import { FcGoogle } from "react-icons/fc";
import { HiMail } from "react-icons/hi";
import { RiLockPasswordFill } from "react-icons/ri";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { signupWithGoogle } from "../services/firebase";
import { getUserByUserId } from "../services/firebase";

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');    

    const isInvalid = password === '' || email === '';

    const handleLogin = (e: FormEvent) => {
        e.preventDefault();
        try {
            signInWithEmailAndPassword(auth, email, password)
                .then(userCred => {
                    console.log(userCred);
                    router.push(ROUTES.DASHBOARD);   
                })
                .catch(err => {
                    console.error(err);
                })
        } catch (err: any) {
            setEmail('');
            setPassword('');
            setError(err.message);
        }        
    }


const googleSignup = async () => {
    const user = await signupWithGoogle(); // should return Firebase User
    console.log(user)
    if (user !== null) {
        const userId = user.uid; 
        const dbUserArray = await getUserByUserId(userId);
        // console.log(dbUserArray)

        // Check for username property safely
        if (
            dbUserArray.length === 0 ||
            !('username' in dbUserArray[0]) ||
            !dbUserArray[0].username
        ) {
            router.push("/CompleteProfile");
        } else {
            router.push(ROUTES.DASHBOARD);
        }
    }
};


    useEffect(() => {
        document.title = "Canonforces Login"
    }, []);

    return (
        <div className={`${styles.login}`}>
            <div className={`${styles.container} flex w-10/12`}>
                <div className="flex justify-center items-center w-6/12">
                    <Image 
                        width={800}
                        height={800}
                        alt="login"src="/images/login.jpg" 
                    />
                </div>
                <div className={`${styles.login__form} w-6/12 flex flex-col items-center justify-center`}>  
                    <h3> Welcome Back! </h3>
                    <p> Lorem Ipsum is simply dummy text of the printing and typesetting industry. </p>
                    {error && <p className="mb-4 text-xs text-read-primary">{error} </p>}
                    <form onSubmit={(e) => handleLogin(e)} className={styles.form} method="POST">
                        <div className="flex flex-col">
                            <div className={styles.form__credentials}>
                                <div className={styles.input}>
                                    <input 
                                        className="shadow appearance-none text-sm rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                        id="email" 
                                        name="email" 
                                        placeholder="Email"
                                        onChange={({target}) => setEmail(target.value)}
                                    />
                                    <HiMail className={styles.mail__icon}/>
                                </div>
                                <div className={styles.input}>
                                    <input 
                                        className="shadow appearance-none text-sm rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                        id="password" 
                                        name="password" 
                                        placeholder="Password"
                                        onChange={({target}) => setPassword(target.value)}
                                    />
                                    <RiLockPasswordFill className={styles.lock__icon}/>  
                                </div>
                            </div>
                        </div>
                        <div className={styles.form__buttons}>
                            <button className={`${styles.login__button} ${isInvalid ? styles.invalid : ""}`} disabled={isInvalid}  type="submit"> Login </button>
                            <button className={styles.google__button} onClick={() => googleSignup()} > <FcGoogle size={"1.6em"} className={styles.google__icon}/> <span> Sign in with Google </span> </button>
                        </div>
                        <div className={styles.login__text}>
                           <p> Already a user ? <Link href={ROUTES.SIGNUP}> Signup </Link> </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
};
