import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import styles from "../../styles/Signup.module.css";
import * as ROUTES from "../../constants/routes";
import { FcGoogle } from "react-icons/fc";
import { HiMail } from "react-icons/hi";
import { RiLockPasswordFill } from "react-icons/ri";
import { BsPatchExclamation, BsPatchCheck } from "react-icons/bs";
import { doesUsernameExists, signupWithGoogle, getUserByUserId } from "../../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { addDoc, collection, setDoc } from "firebase/firestore";

export default function Signup() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [fullname, setFullname] = useState(""); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const isInvalid = password === "" || email === "" || username === "";

    useEffect(() => {
        const isGoogleSignup = localStorage.getItem("googleSignup");
        if (isGoogleSignup === "true") {
            localStorage.removeItem("googleSignup");

            const checkAndRedirect = async () => {
                const currentUser = auth.currentUser;
                if (currentUser) {
                    const userId = currentUser.uid;
                    const dbUserArray = await getUserByUserId(userId);
                    if (
                        dbUserArray.length === 0 ||
                        !("username" in dbUserArray[0]) ||
                        !dbUserArray[0].username
                    ) {
                        router.push("/CompleteProfile");
                    } else {
                        router.push(ROUTES.DASHBOARD);
                    }
                }
            };

            checkAndRedirect();
        }
    }, []);

    const handleSignup = async (e: any) => {
        e.preventDefault();
        const usernameExists = await doesUsernameExists(username);
        if (usernameExists !== null) {
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
                            setDoc(userRef, { userId: user.user.uid }, { merge: true }).then(() => {
                                const currentUser: any = auth.currentUser;
                                if (currentUser) {
                                    currentUser.displayName = username;
                                }
                                router.push(ROUTES.DASHBOARD);
                            });
                        });
                    }).catch(err => {
                        console.error(err);
                        setError(err.message);
                    });
            } catch (err: any) {
                setFullname('');
                setEmail('');
                setPassword('');
                setError(err.message);
            }
        } else {
            setError('Username does not exist on Codeforces');
            setUsername('');
        }
    };

    const googleSignup = async () => {
        localStorage.setItem("googleSignup", "true"); 
        await signupWithGoogle(); 
    };

    return (
        <div className={`${styles.signup}`}>
            <div className={`${styles.container} flex w-10/12`}>
                <div className={`${styles.signup__form} w-6/12 flex flex-col items-center justify-center`}>
                    <h3>Welcome to Canonforces!</h3>
                    <p> Level up your DSA journey — not alone, but with friends.</p>
                    {error && <p className="mb-4 text-xs text-read-primary">{error}</p>}
                    <form className={styles.form} method="POST">
                        <div className="flex flex-col">
                            <div className={styles.form__credentials}>
                                <label className={styles.username__label}>Enter your Codeforces username</label>
                                <div className={styles.input}>
                                    <input
                                        className="shadow appearance-none text-sm rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="Username"
                                        type="text"
                                        onChange={({ target }) => setUsername(target.value)}
                                        value={username}
                                        name="username"
                                    />
                                    {username ? <BsPatchCheck className={styles.check__icon} /> : <BsPatchExclamation className={styles.exclaimation__icon} />}
                                </div>
                                <div className={styles.input}>
                                    <input
                                        className="shadow appearance-none text-sm rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="Fullname"
                                        type="text"
                                        onChange={({ target }) => setFullname(target.value)}
                                        value={fullname}
                                        name="fullname"
                                    />
                                    <HiMail className={styles.mail__icon} />
                                </div>
                                <div className={styles.input}>
                                    <input
                                        className="shadow appearance-none text-sm rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="Email"
                                        type="email"
                                        onChange={({ target }) => setEmail(target.value)}
                                        value={email}
                                        name="email"
                                    />
                                    <HiMail className={styles.mail__icon} />
                                </div>
                                <div className={styles.input}>
                                    <input
                                        className="shadow appearance-none text-sm rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        name="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={({ target }) => setPassword(target.value)}
                                    />
                                    <RiLockPasswordFill className={styles.lock__icon} />
                                </div>
                            </div>
                        </div>
                        <div className={styles.form__buttons}>
                            <button className={`${styles.signup__button} ${isInvalid ? styles.invalid : ""}`} disabled={isInvalid} onClick={handleSignup}>
                                Signup
                            </button>
                            <button className={styles.google__button} type="button" onClick={googleSignup}>
                                <FcGoogle size={"1.6em"} className={styles.google__icon} /> <span>Sign in with Google</span>
                            </button>
                        </div>
                        <div className={styles.signup__text}>
                            <p>Already a user? <Link href={ROUTES.LOGIN}>Login</Link></p>
                        </div>
                    </form>
                </div>
                <div className="flex justify-center items-center w-6/12">
                    <Image width={800} height={800} alt="login" src="/images/signup.jpg" />
                </div>
            </div>
        </div>
    );
}
