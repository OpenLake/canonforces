import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";

export default function CompleteProfile() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async () => {
    if (!user) return setError("User not logged in.");
    if (!username.trim()) return setError("Username cannot be empty.");

    setLoading(true);
    setError("");

    try {
      await Promise.race([
        updateDoc(doc(db, "users", user.uid), {
          username: username.trim(),
          profileCompleted: true,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Firestore timeout")), 10000)
        ),
      ]);

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to save profile. Check network.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-600 text-lg">Loading user...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h2 className="text-3xl font-bold mb-6">Complete Your Profile</h2>

      {error && (
        <div className="mb-4 w-full max-w-sm text-center bg-red-100 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
        className="mb-6 w-full max-w-sm px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />

      <button
        onClick={handleSubmit}
        disabled={loading || !username.trim()}
        className={`w-full max-w-sm py-2 rounded text-white font-semibold transition ${
          loading || !username.trim()
            ? "bg-yellow-300 cursor-not-allowed"
            : "bg-yellow-500 hover:bg-yellow-600"
        }`}
      >
        {loading ? "Saving…" : "Continue"}
      </button>

      {loading && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span className="text-gray-700 font-medium">
              Saving profile…
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
