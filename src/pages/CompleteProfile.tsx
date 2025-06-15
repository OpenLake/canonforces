import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import * as ROUTES from "../constants/routes";
import { getAuth, User } from "firebase/auth";
import { app } from "../lib/firebase";
import { setDoc, doc, getFirestore } from "firebase/firestore";

const CompleteProfile = () => {
    const [username, setUserName] = useState("");
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setFirebaseUser(user);
            } else {
                router.push(ROUTES.LOGIN);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSave = async () => {
        if (!username.trim() || !firebaseUser) return;

        const db = getFirestore(app);
        const userRef = doc(db, "users", firebaseUser.uid);

        await setDoc(userRef, {
            userId: firebaseUser.uid,
            fullname: firebaseUser.displayName || "",
            emailAddress: firebaseUser.email || "",
            photoURL: firebaseUser.photoURL || "",
            username: username.trim(),
            createdAt: Date.now(),
        });

        router.push(ROUTES.DASHBOARD);
    };

    if (!firebaseUser) {
        return <div className="text-center mt-20 text-lg">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-100 to-yellow-50 flex items-center justify-center">
            <div className="bg-white bg-opacity-70 backdrop-blur-md shadow-xl rounded-2xl p-8 w-[90%] max-w-md text-center border border-gray-200">
                <h1 className="text-2xl font-semibold mb-4 text-gray-800">Complete Your Profile</h1>
                <p className="mb-6 text-sm text-gray-600">
                    Please enter your Codeforces handle to continue.
                </p>
                <input
                    value={username}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. tourist"
                    className="border border-gray-300 p-2 w-full rounded-lg mb-4 focus:ring-2 focus:ring-orange-300 focus:outline-none"
                />
                <button
                    onClick={handleSave}
                    className="bg-orange-500 text-white px-4 py-2 w-full rounded-lg hover:bg-orange-600 transition"
                >
                    Save & Continue
                </button>
            </div>
        </div>
    );
};

export default CompleteProfile;
