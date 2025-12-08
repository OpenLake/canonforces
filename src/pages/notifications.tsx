// src/pages/notifications.tsx

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Notification } from "../types/notification";
import NotificationItem from "../common/components/Notifications/NotificationItem";
import styles from "../common/components/Notifications/Notifications.module.css";

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

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

    useEffect(() => {
        if (!userId) return;

        fetchNotifications();
    }, [userId]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/v1/notifications?userId=${userId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch notifications");
            }

            setNotifications(data.notifications || []);
        } catch (err) {
            console.error("Error fetching notifications:", err);
            setError(err instanceof Error ? err.message : "Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            const response = await fetch(`/api/v1/notifications/read/${notificationId}`, {
                method: "POST",
            });

            if (response.ok) {
                setNotifications((prev) =>
                    prev.map((notif) =>
                        notif.id === notificationId ? { ...notif, read: true } : notif
                    )
                );
            }
        } catch (err) {
            console.error("Error marking notification as read:", err);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!userId) return;

        try {
            const response = await fetch("/api/v1/notifications/read-all", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId }),
            });

            if (response.ok) {
                setNotifications((prev) =>
                    prev.map((notif) => ({ ...notif, read: true }))
                );
            }
        } catch (err) {
            console.error("Error marking all notifications as read:", err);
        }
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <>
            <Head>
                <title>Notifications - CanonForces</title>
                <meta name="description" content="View your notifications" />
            </Head>

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        {/* Header */}
                        <div className="border-b border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Notifications
                                    </h1>
                                    {unreadCount > 0 && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                                        </p>
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {loading ? (
                                <div className={styles.loadingState}>
                                    <p>Loading notifications...</p>
                                </div>
                            ) : error ? (
                                <div className={styles.errorState}>
                                    <p>Error: {error}</p>
                                    <button
                                        onClick={fetchNotifications}
                                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>🔔</div>
                                    <p className={styles.emptyText}>No notifications yet</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        When you get notifications, they'll show up here
                                    </p>
                                </div>
                            ) : (
                                <div className={styles.notificationsList}>
                                    {notifications.map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onMarkAsRead={handleMarkAsRead}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
