import React, { useState, useEffect, useContext } from "react";
import { ContestProblem, PastContest } from "../../types/contest-submission";
import UserContext from "../../context/user";
import styles from "./SolutionsListModal.module.css";
import { BsX, BsArrowUpCircle, BsArrowUpCircleFill, BsCodeSlash, BsCheckCircleFill, BsXCircleFill } from "react-icons/bs";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { db } from "../../lib/firebase";
import { collection, query, where, orderBy, limit, getDocs, doc, updateDoc, increment, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface Solution {
    id: string;
    userId: string;
    language: string;
    submittedAt: any; // Timestamp or Date
    isVerified: boolean;
    upvotes: number;
    isUpvoted: boolean;
    code: string;
    verdict?: string;
    upvotedBy?: string[];
}

interface SolutionsListModalProps {
    contest: PastContest;
    problem: ContestProblem;
    onClose: () => void;
}

export default function SolutionsListModal({ contest, problem, onClose }: SolutionsListModalProps) {
    const user = useContext(UserContext);
    const [solutions, setSolutions] = useState<Solution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userHasSubmitted, setUserHasSubmitted] = useState(false);
    const [usernames, setUsernames] = useState<Record<string, string>>({});
    const [expandedSolutionId, setExpandedSolutionId] = useState<string | null>(null);

    useEffect(() => {
        const fetchSolutions = async () => {
            try {
                const solutionsRef = collection(db, "contest_submissions");

                // Main query for all solutions
                const q = query(
                    solutionsRef,
                    where("contestId", "==", contest.contestId),
                    where("problemId", "==", problem.problemId),
                    limit(50)
                );

                let userSubmissionPromise = Promise.resolve(null as any);
                if (user?.uid) {
                    const userQ = query(
                        solutionsRef,
                        where("contestId", "==", contest.contestId),
                        where("problemId", "==", problem.problemId),
                        where("userId", "==", user.uid),
                        limit(1)
                    );
                    userSubmissionPromise = getDocs(userQ);
                }

                const [querySnapshot, userSubmissionSnapshot] = await Promise.all([
                    getDocs(q),
                    userSubmissionPromise
                ]);

                // Process main solutions
                const mapToSolution = (doc: any): Solution => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        userId: data.userId,
                        language: data.language,
                        submittedAt: data.submittedAt?.toDate?.() || data.submittedAt,
                        isVerified: data.isVerified || false,
                        upvotes: data.upvotes || 0,
                        code: data.code,
                        verdict: data.verdict,
                        upvotedBy: data.upvotedBy || [],
                        isUpvoted: user ? (data.upvotedBy || []).includes(user.uid) : false
                    };
                };

                const mainSolutions = querySnapshot.docs.map(mapToSolution);
                const userSolutions = userSubmissionSnapshot && !userSubmissionSnapshot.empty
                    ? userSubmissionSnapshot.docs.map(mapToSolution)
                    : [];

                // Validating user submission status
                let hasSubmission = false;
                if (userSolutions.length > 0) {
                    hasSubmission = true;
                } else {
                    hasSubmission = user ? mainSolutions.some(sol => sol.userId === user.uid) : false;
                }
                setUserHasSubmitted(hasSubmission);

                // Combine and deduplicate
                const allSolutionsMap = new Map<string, Solution>();
                mainSolutions.forEach(s => allSolutionsMap.set(s.id, s));
                userSolutions.forEach((s: Solution) => allSolutionsMap.set(s.id, s));

                const allSolutions = Array.from(allSolutionsMap.values());

                // Sort in memory: User's solution first, then by upvotes
                allSolutions.sort((a, b) => {
                    if (user && a.userId === user.uid) return -1;
                    if (user && b.userId === user.uid) return 1;
                    return b.upvotes - a.upvotes;
                });

                setSolutions(allSolutions);

                // Fetch usernames
                const uniqueUserIds = Array.from(new Set(allSolutions.map(s => s.userId)));
                const userMap: Record<string, string> = {};

                await Promise.all(uniqueUserIds.map(async (uid) => {
                    try {
                        const userSnap = await getDoc(doc(db, "users", uid));
                        if (userSnap.exists()) {
                            const userData = userSnap.data();
                            userMap[uid] = userData.username || userData.displayName || "Unknown";
                        }
                    } catch (e) {
                        // ignore error
                    }
                }));
                setUsernames(userMap);

            } catch (err: any) {
                console.error("Failed to fetch solutions:", err);
                if (err.code === 'permission-denied') {
                    setError("Missing permissions.");
                } else if (err.message && err.message.includes("index")) {
                   setError(err.message);
                } else {
                    setError("Failed to load: " + err.message);
                }
                toast.error("Failed to load solutions.");
            } finally {
                setLoading(false);
            }
        };

        if (contest.contestId && problem.problemId) {
            fetchSolutions();
        }
    }, [contest.contestId, problem.problemId, user]);



    const toggleCode = (solutionId: string) => {
        setExpandedSolutionId(prev => prev === solutionId ? null : solutionId);
    };

    const getEditorLanguage = (lang: string): string => {
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

    const handleUpvote = async (solutionId: string, currentUpvotes: number, isUpvoted: boolean) => {
        if (!user) {
            toast.error("You must be logged in to upvote.");
            return;
        }

        // Optimistic UI Update
        const nextUpvotes = isUpvoted ? Math.max(0, currentUpvotes - 1) : currentUpvotes + 1;
        const nextIsUpvoted = !isUpvoted;

        setSolutions(prev => prev.map(sol =>
            sol.id === solutionId
                ? { ...sol, upvotes: nextUpvotes, isUpvoted: nextIsUpvoted }
                : sol
        ));

        try {
            const solutionRef = doc(db, "contest_submissions", solutionId);
            if (isUpvoted) {
                await updateDoc(solutionRef, {
                    upvotes: increment(-1),
                    upvotedBy: arrayRemove(user.uid)
                });
            } else {
                await updateDoc(solutionRef, {
                    upvotes: increment(1),
                    upvotedBy: arrayUnion(user.uid)
                });
            }
        } catch (err: any) {
            console.error("Error updating upvote:", err);

            // Revert optimistic update
            setSolutions(prev => prev.map(sol =>
                sol.id === solutionId
                    ? { ...sol, upvotes: currentUpvotes, isUpvoted: isUpvoted }
                    : sol
            ));

            if (err.code === 'permission-denied') {
                toast.error("Permission denied. You cannot upvote this solution.");
            } else {
                toast.error("Failed to update upvote.");
            }
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>
                            <BsCodeSlash /> Solutions
                        </h2>
                        <p className={styles.subtitle}>
                            <strong>Problem {problem.problemIndex}: {problem.problemName}</strong>
                        </p>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <BsX size={28} />
                    </button>
                </div>

                <div className={styles.content}>
                    {loading ? (
                        <p>Loading solutions...</p>
                    ) : error ? (
                        <div style={{ color: '#ef4444', textAlign: 'center', padding: '20px' }}>
                            <p><strong>Error:</strong></p>
                            <p>{error}</p>
                        </div>
                    ) : (
                        <>


                            {(() => {
                                const userSolution = user ? solutions.find(s => s.userId === user.uid) : null;
                                const otherSolutions = solutions.filter(s => !user || s.userId !== user.uid);

                                const renderSolutionsTable = (sols: Solution[], showHeader: boolean = true) => (
                                    <table className={styles.table} style={{ marginBottom: '24px' }}>
                                        <thead>
                                            <tr>
                                                <th>User</th>
                                                <th>Language</th>
                                                <th>Status</th>
                                                <th>Upvotes</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sols.map((solution) => (
                                                <React.Fragment key={solution.id}>
                                                    <tr>
                                                        <td className={styles.userCell}>
                                                            {usernames[solution.userId] ? (
                                                                <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>{usernames[solution.userId]}</span>
                                                            ) : (
                                                                `User_${solution.userId.slice(0, 6)}`
                                                            )}
                                                        </td>
                                                        <td>{solution.language}</td>
                                                        <td>
                                                            <span className={`${styles.verdictCell} ${styles.verdictSuccess}`}>
                                                                <BsCheckCircleFill /> Accepted
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button
                                                                onClick={() => handleUpvote(solution.id, solution.upvotes, solution.isUpvoted)}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                    color: solution.isUpvoted ? '#10b981' : '#9ca3af',
                                                                    fontSize: '1rem',
                                                                    padding: '4px 8px',
                                                                    borderRadius: '4px',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                            >
                                                                {solution.isUpvoted ? <BsArrowUpCircleFill size={18} /> : <BsArrowUpCircle size={18} />}
                                                                <span style={{ fontWeight: 600 }}>{solution.upvotes || 0}</span>
                                                            </button>
                                                        </td>
                                                        <td>
                                                            <button className={styles.viewCodeButton} onClick={() => toggleCode(solution.id)}>
                                                                {expandedSolutionId === solution.id ? "Hide Code" : "View Code"}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {expandedSolutionId === solution.id && (
                                                        <tr className={styles.expandedRow}>
                                                            <td colSpan={5} className={styles.expandedCell}>
                                                                <div className={styles.editorWrapper} style={{ height: '300px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                                                                    <Editor
                                                                        height="100%"
                                                                        language={getEditorLanguage(solution.language)}
                                                                        value={solution.code}
                                                                        theme="vs-dark"
                                                                        options={{
                                                                            readOnly: true,
                                                                            minimap: { enabled: false },
                                                                            fontSize: 14,
                                                                            lineNumbers: "on",
                                                                            scrollBeyondLastLine: false,
                                                                            padding: { top: 16, bottom: 16 }
                                                                        }}
                                                                    />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                );

                                if (solutions.length === 0) {
                                    return <p>{userHasSubmitted ? "No solutions from other users yet." : "No solutions found for this problem yet. Be the first to solve it!"}</p>;
                                }

                                return (
                                    <>
                                        {userSolution && (
                                            <div style={{ marginBottom: '32px' }}>
                                                <h3 style={{ marginBottom: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <BsCheckCircleFill /> Your Solution
                                                </h3>
                                                {renderSolutionsTable([userSolution])}
                                            </div>
                                        )}

                                        {otherSolutions.length > 0 && (
                                            <div>
                                                {renderSolutionsTable(otherSolutions)}
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
