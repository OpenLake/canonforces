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
import { doesUsernameExists, /*signupWithGoogle,*/ getUserByUserId } from "../../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { addDoc, collection, setDoc } from "firebase/firestore";

export default function Signup() {
    const router = useRouter();

    // For email/password signup
    const [username, setUsername] = useState("");
    const [fullname, setFullname] = useState(""); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const isInvalid = password === "" || email === "" || username === "";

    // Google signup redirect logic (commented out)
    // useEffect(() => {
    //     const isGoogleSignup = localStorage.getItem("googleSignup");
    //     if (isGoogleSignup === "true") {
    //         localStorage.removeItem("googleSignup");

    //         const checkAndRedirect = async () => {
    //             const currentUser = auth.currentUser;
    //             if (currentUser) {
    //                 const userId = currentUser.uid;
    //                 const dbUserArray = await getUserByUserId(userId);
    //                 // Check if the user object has a username property
    //                 if (
    //                     !dbUserArray.length ||
    //                     !("username" in dbUserArray[0]) ||
    //                     !dbUserArray[0].username
    //                 ) {
    //                     router.push("/CompleteProfile");
    //                 } else {
    //                     router.push(ROUTES.DASHBOARD);
    //                 }
    //             }
    //         };

    //         checkAndRedirect();
    //     }
    // }, []);

    // Email/password signup handler
    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            setLoading(false);
            return;
        }

        const usernameExists = await doesUsernameExists(username);
        if (usernameExists !== null && usernameExists) {
            try {
                createUserWithEmailAndPassword(auth, email, password)
                    .then((user) => {
                        addDoc(collection(db, "users"), {
                            username: username.toLowerCase(),
                            userId: user.user.uid,
                            fullname,
                            emailAddress: email.toLowerCase(),
                            following: [],
                            dateCreated: Date.now()
                        })
                        .then(() => {
                            router.push(ROUTES.DASHBOARD);
                            setLoading(false);
                        });
                    }).catch(err => {
                        if (err.code === "auth/email-already-in-use") {
                            setError("This email is already registered. Please login or use another email.");
                        } else if (err.code === "auth/invalid-email") {
                            setError("Please enter a valid email address.");
                        } else if (err.code === "auth/weak-password") {
                            setError("Password must be at least 6 characters.");
                        } else {
                            setError(err.message);
                        }
                        setLoading(false);
                    });
            } catch (err) {
                setFullname('');
                setEmail('');
                setPassword('');
                setError(err instanceof Error ? err.message : String(err));
                setLoading(false);
            }
        } else {
            setError('Username does not exist on Codeforces');
            setLoading(false);
        }
    };

    // Google signup handler (commented out)
    // const googleSignup = async () => {
    //     localStorage.setItem("googleSignup", "true");
    //     await signupWithGoogle();
    // };

    return (
        <div className={styles.signup}>
            <div className={`${styles.container} flex flex-col md:flex-row w-11/12 md:w-9/12 shadow-xl rounded-2xl bg-white overflow-hidden`}>
                {/* Left Side - Form */}
                <div className={`${styles.signup__form} w-full md:w-6/12 flex flex-col items-center justify-center py-10 px-6`}>
                    <h3 className="font-bold text-3xl mb-2 text-gray-900">Create your Canonforces account</h3>
                    <p className="mb-6 text-base text-gray-600 text-center max-w-xs">
                        Level up your DSA journey — not alone, but with friends. Join Canonforces and start competing!
                    </p>
                    {error && (
                        <div className="mb-4 w-full flex items-center bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded relative">
                            <span className="flex-1 text-sm">{error}</span>
                            <button
                                className="ml-2 text-lg font-bold"
                                onClick={() => setError("")}
                                aria-label="Dismiss error"
                            >
                                ×
                            </button>
                        </div>
                    )}
                    <form className={styles.form + " w-full max-w-sm"} method="POST" onSubmit={handleSignup} autoComplete="on">
                        <div className="flex flex-col gap-3">
                            <label className="text-gray-700 text-sm font-medium mb-1">Enter your Codeforces username</label>
                            <div className={styles.input + " relative"}>
                                <input
                                    className="shadow appearance-none text-base rounded-md w-full py-2 pl-3 pr-10 text-gray-700 leading-tight border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                    placeholder="Username"
                                    type="text"
                                    onChange={({ target }) => setUsername(target.value)}
                                    value={username}
                                    name="username"
                                    required
                                    disabled={loading}
                                />
                                {username ? (
                                    <BsPatchCheck className={styles.check__icon + " absolute right-3 top-2.5 text-green-500"} />
                                ) : (
                                    <BsPatchExclamation className={styles.exclaimation__icon + " absolute right-3 top-2.5 text-red-500"} />
                                )}
                            </div>
                            <div className={styles.input + " relative"}>
                                <input
                                    className="shadow appearance-none text-base rounded-md w-full py-2 pl-3 pr-10 text-gray-700 leading-tight border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                    placeholder="Full name"
                                    type="text"
                                    onChange={({ target }) => setFullname(target.value)}
                                    value={fullname}
                                    name="fullname"
                                    required
                                    disabled={loading}
                                />
                                <HiMail className={styles.mail__icon + " absolute right-3 top-2.5 text-gray-400"} />
                            </div>
                            <div className={styles.input + " relative"}>
                                <input
                                    className="shadow appearance-none text-base rounded-md w-full py-2 pl-3 pr-10 text-gray-700 leading-tight border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                    placeholder="Email"
                                    type="email"
                                    onChange={({ target }) => setEmail(target.value)}
                                    value={email}
                                    name="email"
                                    required
                                    disabled={loading}
                                />
                                <HiMail className={styles.mail__icon + " absolute right-3 top-2.5 text-gray-400"} />
                            </div>
                            <div className={styles.input + " relative"}>
                                <input
                                    className="shadow appearance-none text-base rounded-md w-full py-2 pl-3 pr-10 text-gray-700 leading-tight border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                    name="password"
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={({ target }) => setPassword(target.value)}
                                    required
                                    disabled={loading}
                                />
                                <RiLockPasswordFill className={styles.lock__icon + " absolute right-3 top-2.5 text-gray-400"} />
                            </div>
                        </div>
                        <div className="w-full mt-6 flex flex-col gap-3">
                            <button
                                className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg h-11 transition-all duration-150 shadow-md ${isInvalid || loading ? "opacity-60 cursor-not-allowed" : ""}`}
                                disabled={isInvalid || loading}
                                type="submit"
                            >
                                {loading ? "Signing up..." : "Signup"}
                            </button>
                            {/* 
                            <button
                                type="button"
                                className="flex items-center justify-center border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg h-11 font-medium transition-all duration-150 shadow-sm"
                                onClick={googleSignup}
                                disabled={loading}
                            >
                                <FcGoogle size={"1.6em"} className="mr-2" />
                                <span>Sign up with Google</span>
                            </button>
                            */}
                        </div>
                        <div className="w-full flex justify-center mt-4">
                            <p className="text-sm text-gray-600">
                                Already have an account?{" "}
                                <Link href={ROUTES.LOGIN} className="text-blue-600 hover:underline font-medium">
                                    Login
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
                {/* Right Side - Image */}
                <div className="hidden md:flex justify-center items-center w-6/12 bg-gray-50">
                    <Image width={480} height={480} alt="signup" src="/images/signup.jpg" className="rounded-2xl object-cover" />
                </div>
            </div>

             </div>
    );
}