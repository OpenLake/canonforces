import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import styles from "../../styles/Signup.module.css";
import * as ROUTES from "../../constants/routes";
import { FcGoogle } from "react-icons/fc";
import { HiMail } from "react-icons/hi";
import { RiLockPasswordFill } from "react-icons/ri";
import { BsPatchExclamation, BsPatchCheck } from "react-icons/bs";
import {
    doesUsernameExists,
    isCanonforcesUsernameTaken,
    getUserByUserId,
} from "../../services/firebase";
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

// Define a type for Firebase errors to safely access 'code'
type FirebaseError = {
    code: string;
    message: string;
};

// Helper to check if an error is a FirebaseError
function isFirebaseError(err: unknown): err is FirebaseError {
    return typeof err === 'object' && err !== null && 'code' in err && 'message' in err;
}

export default function Signup() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const isInvalid = password === "" || email === "" || fullname === "" || username === "";

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        setLoading(true);

        try {
            const cfUserExists = await doesUsernameExists(username);
            if (!cfUserExists) {
                setError("This username does not exist on Codeforces.");
                setLoading(false);
                return;
            }
            
            const usernameIsTaken = await isCanonforcesUsernameTaken(username);
            if (usernameIsTaken) {
                setError("This Codeforces username is already registered.");
                setLoading(false);
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            await setDoc(doc(db, "users", user.uid), {
                username: username.trim(),
                fullname,
                emailAddress: email.toLowerCase(),
                following: [],
                dateCreated: Date.now(),
            });

            router.push(ROUTES.DASHBOARD);

        } catch (err) {
            if (isFirebaseError(err)) {
                if (err.code === "auth/email-already-in-use") {
                    setError("This email is already registered. Please login.");
                } else if (err.code === "auth/invalid-email") {
                    setError("Please enter a valid email address.");
                } else {
                    setError(err.message);
                }
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };
    
    const handleGoogleLogin = async () => {
        setError("");
        if (!username) {
            setError("Please enter your Codeforces username first.");
            return;
        }
        setLoading(true);

        try {
            const cfUserExists = await doesUsernameExists(username);
            if (!cfUserExists) {
                setError("This username does not exist on Codeforces.");
                setLoading(false);
                return;
            }

            const usernameIsTaken = await isCanonforcesUsernameTaken(username);
            if (usernameIsTaken) {
                setError("This Codeforces username is already registered.");
                setLoading(false);
                return;
            }

            const googleProvider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            if (!user.email) {
                setError("Could not retrieve email from Google. Please try another method.");
                setLoading(false);
                return;
            }
            
            // It's safer to use auth.currentUser.uid after the popup completes
            const currentAuthUser = auth.currentUser;
            if (!currentAuthUser) {
                setError("Authentication failed. Please try again.");
                setLoading(false);
                return;
            }

            const userExistsInDb = await getUserByUserId(currentAuthUser.uid);
            if (userExistsInDb && userExistsInDb.length > 0) {
                router.push(ROUTES.DASHBOARD);
                return;
            }

            await setDoc(doc(db, "users", currentAuthUser.uid), {
                username: username.toLowerCase(),
                fullname: user.displayName,
                emailAddress: user.email.toLowerCase(),
                following: [],
                dateCreated: Date.now(),
            });

            router.push(ROUTES.DASHBOARD);

        } catch (err) {
            console.error("Google Sign-In Failed:", err);
            if (isFirebaseError(err) && err.code === "auth/popup-closed-by-user") {
                setError("Google sign-in was cancelled.");
            } else {
                setError("An unexpected error occurred during Google sign-in.");
            }
        } finally {
            setLoading(false);
        }
    };

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
                                    <BsPatchCheck className="absolute right-3 top-2.5 h-5 w-5 text-green-500" />
                                ) : (
                                    <BsPatchExclamation className="absolute right-3 top-2.5 h-5 w-5 text-red-500" />
                                )}
                            </div>
                            <label className="text-gray-700 text-sm font-medium mb-1 mt-2">Then, sign up with Email or Google</label>
                            <div className={styles.input + " relative"}>
                                <input
                                    className="shadow appearance-none text-base rounded-md w-full py-2 pl-3 pr-10 text-gray-700 leading-tight border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                    placeholder="Full name"
                                    type="text"
                                    onChange={({ target }) => setFullname(target.value)}
                                    value={fullname}
                                    name="fullname"
                                    disabled={loading}
                                />
                                <HiMail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                            </div>
                            <div className={styles.input + " relative"}>
                                <input
                                    className="shadow appearance-none text-base rounded-md w-full py-2 pl-3 pr-10 text-gray-700 leading-tight border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                    placeholder="Email"
                                    type="email"
                                    onChange={({ target }) => setEmail(target.value)}
                                    value={email}
                                    name="email"
                                    disabled={loading}
                                />
                                <HiMail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                            </div>
                            <div className={styles.input + " relative"}>
                                <input
                                    className="shadow appearance-none text-base rounded-md w-full py-2 pl-3 pr-10 text-gray-700 leading-tight border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                    name="password"
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={({ target }) => setPassword(target.value)}
                                    disabled={loading}
                                />
                                <RiLockPasswordFill className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                        <div className="w-full mt-6 flex flex-col gap-3">
                            <button
                                className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg h-11 transition-all duration-150 shadow-md ${isInvalid || loading ? "opacity-60 cursor-not-allowed" : ""}`}
                                disabled={isInvalid || loading}
                                type="submit"
                            >
                                {loading ? "Signing up..." : "Signup with Email"}
                            </button>
                            
                            <button
                                type="button"
                                className={`flex items-center justify-center border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg h-11 font-medium transition-all duration-150 shadow-sm ${!username || loading ? "opacity-60 cursor-not-allowed" : ""}`}
                                onClick={handleGoogleLogin}
                                disabled={!username || loading}
                            >
                                <FcGoogle size={"1.6em"} className="mr-2" />
                                <span>Sign up with Google</span>
                            </button>
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

