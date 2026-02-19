import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import styles from "../styles/Login.module.css";
import * as ROUTES from "../constants/routes";
import { FcGoogle } from "react-icons/fc";
import { HiMail } from "react-icons/hi";
import { RiLockPasswordFill } from "react-icons/ri";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../lib/firebase";
import { getUserByUserId } from "../services/firebase";
import { BsArrowLeft } from "react-icons/bs";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isInvalid = password === "" || email === "";

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push(ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(
        err?.message === "Firebase: Error (auth/user-not-found)."
          ? "No user found with this email."
          : err?.message === "Firebase: Error (auth/wrong-password)."
          ? "Incorrect password. Please try again."
          : "Failed to login. Please check your credentials."
      );
      setPassword("");
    }
    setLoading(false);
  };

    const handleGoogleLogin = async () => {
      setError("");
      setLoading(true);

      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        if (!user?.uid) {
          setError("Google authentication failed. Please try again.");
          return;
        }

        // 🔑 CHECK IF USER PROFILE EXISTS IN DB
        const userDoc = await getUserByUserId(user.uid);

        if (userDoc !== null) {
          router.push(ROUTES.DASHBOARD);
        } else {
          // New Google user trying to login
          router.push(ROUTES.SIGNUP);
        }

      } catch (err) {
        console.error("Google login failed", err);
        setError("Google sign-in failed. Please try again.");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    document.title = "Canonforces Login";
  }, []);

  return (
    <div className={styles.login}>
      <div className={`${styles.container} flex flex-col md:flex-row w-11/12 md:w-9/12 shadow-xl rounded-2xl bg-white overflow-hidden`}>
        {/* Left Side - Image */}
        <div className="hidden md:flex justify-center items-center w-6/12 bg-gray-50">
          <Image
            width={480}
            height={480}
            alt="Login illustration"
            src="/images/login.jpg"
            className="rounded-2xl object-cover"
          />
        </div>
        {/* Right Side - Form */}
        <div className={`${styles.login__form} w-full md:w-6/12 flex flex-col items-center justify-center py-10 px-6`}>
          <h3 className="font-bold text-3xl mb-2 text-gray-900">Welcome Back!</h3>
          <p className="mb-6 text-base text-gray-600 text-center max-w-xs">
            Sign in to your Canonforces account to continue your coding journey and compete with the best.
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
          <form onSubmit={handleLogin} className={styles.form + " w-full max-w-sm"} method="POST" autoComplete="on">
            <div className="flex flex-col gap-4">
              <div className={styles.input + " relative"}>
                <input
                  className="shadow appearance-none text-base rounded-md w-full py-2 pl-10 pr-3 text-gray-700 leading-tight border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                  value={email}
                  onChange={({ target }) => setEmail(target.value)}
                  required
                  disabled={loading}
                />
                <HiMail className={styles.mail__icon + " absolute left-3 top-2.5 text-gray-400"} />
              </div>
              <div className={styles.input + " relative"}>
                <input
                  className="shadow appearance-none text-base rounded-md w-full py-2 pl-10 pr-3 text-gray-700 leading-tight border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={({ target }) => setPassword(target.value)}
                  required
                  disabled={loading}
                />
                <RiLockPasswordFill className={styles.lock__icon + " absolute left-3 top-2.5 text-gray-400"} />
              </div>
            </div>
            <div className="w-full mt-6 flex flex-col gap-3">
              <button
                className={`${styles.login__button} bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg h-11 transition-all duration-150 shadow-md ${isInvalid || loading ? "opacity-60 cursor-not-allowed" : ""}`}
                disabled={isInvalid || loading}
                type="submit"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <button
                type="button"
                className="flex items-center justify-center border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg h-11 font-medium transition-all duration-150 shadow-sm"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <FcGoogle size={"1.6em"} className="mr-2" />
                <span>Sign in with Google</span>
              </button>
            </div>
            <div className="w-full flex justify-center mt-4">
              <p className="text-sm text-gray-600">
                New here?{" "}
                <Link href={ROUTES.SIGNUP} className="text-yellow-500 hover:underline font-medium">
                  Create an account
                </Link>
              </p>
            </div>
          </form>
          {/* Added Button From Back to HomePage BY KJK */}
          <button onClick={() => router.push("/")} className="absolute top-6 left-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition">
            <BsArrowLeft />
            Back to HomePage
          </button>
          {loading && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow-lg flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-yellow-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                <span>Loading...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
