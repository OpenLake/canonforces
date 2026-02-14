import React, { useState, useContext } from "react";
import dynamic from "next/dynamic";
import { BsX, BsCodeSlash, BsCheckCircleFill } from "react-icons/bs";
import { SUPPORTED_LANGUAGES, SupportedLanguage, PastContest, ContestProblem } from "../../types/contest-submission";
import UserContext from "../../context/user";
import styles from "./SolutionSubmitModal.module.css";
import { toast } from "sonner";
import { doc, getDoc, runTransaction, collection, query, where, limit, getDocs, serverTimestamp, increment } from "firebase/firestore";
import { db } from "../../lib/firebase";

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface SolutionSubmitModalProps {
    contest: PastContest;
    problem: ContestProblem;
    onClose: () => void;
    onSuccess?: () => void;
}

const SolutionSubmitModal: React.FC<SolutionSubmitModalProps> = ({
    contest,
    problem,
    onClose,
    onSuccess,
}) => {
    const user = useContext(UserContext);
    const [language, setLanguage] = useState<SupportedLanguage>("C++");
    const [code, setCode] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [cfHandle, setCfHandle] = useState("");

    // Fetch user's Codeforces handle from Firestore
    React.useEffect(() => {
        const fetchUserHandle = async () => {
            if (user?.uid) {
                try {
                    const userRef = doc(db, "users", user.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        if (userData.username) {
                            setCfHandle(userData.username);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user handle:", error);
                }
            }
        };
        fetchUserHandle();
    }, [user]);

    const getEditorLanguage = (lang: SupportedLanguage): string => {
        const languageMap: Record<string, string> = {
            "C++": "cpp",
            "Python": "python",
            "Java": "java",
            "JavaScript": "javascript",
            "C": "c",
            "C#": "csharp",
            "Go": "go",
            "Rust": "rust",
            "Kotlin": "kotlin",
            "Swift": "swift",
        };
        return languageMap[lang] || "cpp";
    };

    const [isVerifying, setIsVerifying] = useState(false);
    const checkCodeforcesSubmission = async (username: string, contestId: string, problemIndex: string) => {
        try {
            const response = await fetch("/api/verify-codeforces", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    handle: username,
                    contestId,
                    problemIndex,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Codeforces verification failed");
            }

            return data.verified;
        } catch (error) {
            console.error("Verification failed", error);
            throw error;
        }
    };

    const saveSubmission = async (
        submittedCode: string,
        submissionLanguage: string,
        isVerified: boolean = false
    ) => {
        if (!user) return;

        // Use a transaction to ensure atomic updates (prevent farming)
        try {
            await runTransaction(db, async (transaction) => {
                // 1. Check for existing submissions
                const submissionsRef = collection(db, "contest_submissions");
                const q = query(
                    submissionsRef,
                    where("userId", "==", user.uid),
                    where("problemId", "==", problem.problemId),
                    limit(1)
                );

                const querySnapshot = await getDocs(q);
                const isFirstSubmission = querySnapshot.empty;
                const coinsEarned = isFirstSubmission ? 10 : 0;

                // 2. Create submission document
                const newSubmissionRef = doc(submissionsRef);
                transaction.set(newSubmissionRef, {
                    userId: user.uid,
                    contestId: contest.contestId,
                    problemId: problem.problemId,
                    problemName: problem.problemName,
                    platform: contest.platform,
                    language: submissionLanguage,
                    code: submittedCode,
                    submittedAt: serverTimestamp(),
                    coinsEarned,
                    isVerified // Flag to track if this was an API verification or manual code upload
                });

                // 3. Update User Coins (only if first time)
                if (isFirstSubmission) {
                    const userRef = doc(db, "users", user.uid);
                    transaction.update(userRef, {
                        coins: increment(coinsEarned)
                    });
                }

                return { isFirstSubmission, coinsEarned };
            }).then((result) => {
                setSuccess(true);
                if (result.isFirstSubmission && result.coinsEarned > 0) {
                    toast.success(`🎉 Solution submitted! You earned ${result.coinsEarned} coins!`, { duration: 5000 });
                } else {
                    toast.info("Solution submitted! (Already submitted this problem before)", { duration: 5000 });
                }
                setTimeout(() => { onSuccess?.(); onClose(); }, 2000);
            });

        } catch (error: any) {
            console.error("Submission error:", error);
            throw new Error("Failed to save submission. Please try again.");
        }
    };

    const handleVerify = async () => {
        if (!user) {
            toast.error("Please log in to verify solutions");
            return;
        }

        if (!cfHandle.trim()) {
            toast.error("Please link your Codeforces handle in settings to verify solutions.");
            return;
        }

        setIsVerifying(true);
        try {
            const isSolved = await checkCodeforcesSubmission(cfHandle, contest.contestId, problem.problemIndex);

            if (isSolved) {
                await saveSubmission(
                    `// Verified via Codeforces API (Handle: ${cfHandle})\n// Date: ${new Date().toISOString()}`,
                    "Verified",
                    true
                );
            } else {
                toast.error(`No accepted submission found for this problem on Codeforces for handle: ${cfHandle}`);
            }
        } catch (error: any) {
            // Error is already logged in checkCodeforcesSubmission or saveSubmission
            if (error.message?.includes("fetch failed")) {
                toast.error("Network error: Could not connect to verification server.");
            } else {
                toast.error(error.message || "Verification failed.");
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSubmit = async () => {
        if (!user) {
            toast.error("Please log in to submit solutions");
            return;
        }

        if (code.trim().length < 10) {
            toast.error("Code is too short. Please write a meaningful solution.");
            return;
        }

        setSubmitting(true);
        try {
            await saveSubmission(code, language, false);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className={styles.overlay} onClick={onClose}>
                <div className={styles.successModal} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.successIcon}>
                        <BsCheckCircleFill size={64} color="#22c55e" />
                    </div>
                    <h2>Solution Submitted!</h2>
                    <p>Your solution has been saved successfully.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerText}>
                        <h2 className={styles.title}>
                            <BsCodeSlash /> Submit Solution
                        </h2>
                        <p className={styles.subtitle}>
                            <strong>Problem {problem.problemIndex}: {problem.problemName}</strong> · {contest.contestName}
                        </p>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <BsX size={28} />
                    </button>
                </div>

                {/* Language Selector */}
                <div className={styles.languageSelector}>
                    <div className={styles.selectorGroup}>
                        <label htmlFor="language">Language:</label>
                        <select
                            id="language"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                            className={styles.select}
                        >
                            {SUPPORTED_LANGUAGES.map((lang) => (
                                <option key={lang} value={lang}>
                                    {lang}
                                </option>
                            ))}
                        </select>
                    </div>


                </div>

                {/* Code Editor */}
                <div className={styles.editorContainer}>
                    <Editor
                        height="100%"
                        language={getEditorLanguage(language)}
                        value={code}
                        onChange={(value) => setCode(value || "")}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: "on",
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                        }}
                    />
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <button className={styles.cancelButton} onClick={onClose}>
                        Cancel
                    </button>
                    {contest.platform === 'codeforces' && (
                        <button
                            className={styles.verifyButton}
                            onClick={handleVerify}
                            disabled={submitting || isVerifying}
                            style={{ backgroundColor: '#3b82f6', marginRight: 'auto', marginLeft: '10px' }}
                        >
                            {isVerifying ? "Verifying..." : "Verify Codeforces Submission"}
                        </button>
                    )}
                    <button
                        className={styles.submitButton}
                        onClick={handleSubmit}
                        disabled={submitting || code.trim().length < 10}
                    >
                        {submitting ? "Submitting..." : "Submit Solution"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SolutionSubmitModal;
