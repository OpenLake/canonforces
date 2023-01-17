import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../../styles/Signup.module.css";
import * as ROUTES from "../../constants/routes";
import { FcGoogle } from "react-icons/fc";
import { HiMail } from "react-icons/hi";
import { RiLockPasswordFill } from "react-icons/ri";
import { BsPatchExclamation, BsPatchCheck} from "react-icons/bs";
import { doesUsernameExists } from "../../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { addDoc, collection, setDoc } from "firebase/firestore";

export default function Signup() {
    const [username, setUsername] = useState("");
    const [fullname, setFullname] = useState(""); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");


    const handleSignup = async (e: any) => {
        e.preventDefault();

        const usernameExists = await doesUsernameExists(username);
        if(usernameExists !== null) {
            try {
                createUserWithEmailAndPassword(auth, email, password)
                .then((user) => {
                    addDoc(collection(db, "users"), {
                        username: username.toLowerCase(),
                        userId: "",
                        fullname,
                        emailAddress: email.toLowerCase(),
                        following: [],
                        dateCreated: Date.now()
                    })
                        .then((userRef) => {
                            console.log(userRef);
                            setDoc(userRef, {userId: user.user.uid}, {merge: true}) 
                                .then(() => {
                                    const currentUser: any = auth.currentUser;
                                    if(currentUser) {
                                        currentUser.displayName = username;
                                    } 
                                    // navigate the user
                                });
                        });
                }) 
            } catch (err: any) {
                setFullname('');
                setEmail("");
                setPassword('');
                setError(err.message);
            }
        }
    }

    return (
        <div className={`${styles.signup}`}>
            <div className={`${styles.container} flex w-full w-10/12`}>
                <div className={`${styles.signup__form} w-6/12 flex flex-col items-center justify-center`}>  
                    <h3> Welcome to Canonforces! </h3>
                    <p> Lorem Ipsum is simply dummy text of the printing and typesetting industry. printing and typesetting industry. </p>
                    <form className={styles.form} action="">
                        <div className="flex flex-col">
                            <div className={styles.form__credentials}>
                                <label className={styles.username__label}>Enter your Codeforces username </label>
                                <div className={styles.input}>
                                    <input className="shadow appearance-none text-sm rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Username"/>
                                    {username ? <BsPatchCheck className={styles.check__icon}/> : <BsPatchExclamation className={styles.exclaimation__icon}/>}
                                </div>
                                <div className={styles.input}>
                                    <input className="shadow appearance-none text-sm rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Email"/>
                                    <HiMail className={styles.mail__icon}/>
                                </div>
                                <div className={styles.input}>
                                    <input className="shadow appearance-none text-sm rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="password" name="password" placeholder="Password"/>
                                    <RiLockPasswordFill className={styles.lock__icon}/>  
                                </div>
                            </div>
                        </div>
                        <div className={styles.form__buttons}>
                            <button className={styles.signup__button} onClick={(e) => handleSignup(e)}>  Signup </button>
                            <button className={styles.google__button}> <FcGoogle size={"1.6em"} className={styles.google__icon}/> <span> Sign in with Google </span> </button>
                        </div>
                        <div className={styles.signup__text}>
                           <p> Already a user ? <Link href={ROUTES.LOGIN}> Login </Link> </p>
                        </div>
                    </form>
                </div>
                <div className="flex justify-center items-center w-6/12">
                    <Image 
                        width={800}
                        height={800}
                        alt="login"src="/images/signup.jpg" 
                    />
                </div>
            </div>
        </div>
    )
};


