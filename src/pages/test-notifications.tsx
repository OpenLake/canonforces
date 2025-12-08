// src/pages/test-notifications.tsx
// This is a test page to manually create and test notifications
// Access at: http://localhost:3000/test-notifications

import React, { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import Head from "next/head";
import { createNotification } from "../services/notifications";

export default function TestNotificationsPage() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [notificationType, setNotificationType] = useState("follow");
    const [customMessage, setCustomMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                router.push("/login");
            }
        });

        return () => unsubscribe();
    }, [router]);

    const handleCreateNotification = async (type: string, metadata: any) => {
        if (!userId) return;

        setLoading(true);
        setResult(null);

        try {
            const notification = await createNotification(userId, type, metadata);

            if (notification) {
                setResult(`✅ Notification created successfully! ID: ${notification.id}`);
            } else {
                setResult("❌ Failed to create notification");
            }
        } catch (error) {
            setResult(`❌ Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const testNotifications = [
        {
            name: "Follow Notification",
            type: "follow",
            metadata: { username: "test_user", userId: "test123" },
        },
        {
            name: "Problem Solved",
            type: "problem_solved",
            metadata: { problemName: "Two Sum", problemId: "prob123" },
        },
        {
            name: "Quiz Completed",
            type: "quiz_completed",
            metadata: { quizName: "Arrays Quiz", quizId: "quiz123", score: 8, total: 10 },
        },
        {
            name: "Contest Reminder",
            type: "contest_reminder",
            metadata: { contestName: "Div 2 Round", contestId: "contest123", timeRemaining: "1 hour" },
        },
        {
            name: "Achievement",
            type: "achievement",
            metadata: { achievementName: "First 10 Problems Solved!" },
        },
        {
            name: "New POTD",
            type: "new_potd",
            metadata: { problemName: "Binary Search", problemId: "potd123" },
        },
        {
            name: "Friend Solved",
            type: "friend_solved",
            metadata: { username: "friend_user", userId: "friend123", problemName: "Graph Problem" },
        },
        {
            name: "Leaderboard Rank",
            type: "leaderboard_rank",
            metadata: { rank: 42 },
        },
        {
            name: "Contest Started",
            type: "contest_started",
            metadata: { contestName: "Weekly Contest", contestId: "contest456" },
        },
        {
            name: "Contest Ended",
            type: "contest_ended",
            metadata: { contestName: "Weekly Contest", contestId: "contest456" },
        },
    ];

    return (
        <>
            <Head>
                <title>Test Notifications - CanonForces</title>
            </Head>

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            🧪 Notification Testing Page
                        </h1>
                        <p className="text-gray-600">
                            Click any button below to create a test notification for yourself.
                            Then check the bell icon or visit the{" "}
                            <a href="/notifications" className="text-blue-600 hover:underline">
                                notifications page
                            </a>
                            .
                        </p>
                        {userId && (
                            <p className="text-sm text-gray-500 mt-2">
                                Your User ID: <code className="bg-gray-100 px-2 py-1 rounded">{userId}</code>
                            </p>
                        )}
                    </div>

                    {result && (
                        <div
                            className={`p-4 rounded-lg mb-6 ${result.startsWith("✅")
                                    ? "bg-green-50 border border-green-200 text-green-800"
                                    : "bg-red-50 border border-red-200 text-red-800"
                                }`}
                        >
                            {result}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {testNotifications.map((test, index) => (
                            <div
                                key={index}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <h3 className="font-semibold text-gray-900 mb-2">{test.name}</h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    Type: <code className="bg-gray-100 px-1 rounded">{test.type}</code>
                                </p>
                                <button
                                    onClick={() => handleCreateNotification(test.type, test.metadata)}
                                    disabled={loading}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                                >
                                    {loading ? "Creating..." : "Create Notification"}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Custom System Notification
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Custom Message
                                </label>
                                <input
                                    type="text"
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    placeholder="Enter your custom message..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={() =>
                                    handleCreateNotification("system", { message: customMessage })
                                }
                                disabled={loading || !customMessage.trim()}
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                            >
                                {loading ? "Creating..." : "Create Custom Notification"}
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
                        <h3 className="font-semibold text-blue-900 mb-2">💡 Tips</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• After creating a notification, check the bell icon in the header</li>
                            <li>• Visit <code>/notifications</code> to see all your notifications</li>
                            <li>• Click on a notification to mark it as read</li>
                            <li>• Use "Mark all as read" to clear all unread notifications</li>
                            <li>• The bell icon updates every 30 seconds automatically</li>
                        </ul>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                        <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Note</h3>
                        <p className="text-sm text-yellow-800">
                            This is a testing page for development purposes. In production, notifications
                            should be created automatically by the system when events occur (e.g., when
                            someone follows you, when you solve a problem, etc.).
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
