// src/common/components/NotificationBell/NotificationBell.tsx

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { auth } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import styles from "./NotificationBell.module.css";

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
                setUnreadCount(0);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        if (!userId) return;

        try {
            const response = await fetch(`/api/v1/notifications?userId=${userId}`);
            const data = await response.json();

            if (response.ok && data.notifications) {
                const unread = data.notifications.filter((n: any) => !n.read).length;
                setUnreadCount(unread);
            }
        } catch (err) {
            console.error("Error fetching unread count:", err);
        }
    }, [userId]);

    useEffect(() => {
        if (!userId) return;

        fetchUnreadCount();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);

        return () => clearInterval(interval);
    }, [userId, fetchUnreadCount]);

    if (!userId) return null;

    return (
        <Link href="/notifications" className={styles.bellContainer}>
            <div className={styles.bellIcon}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                    <span className={styles.badge}>
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </div>
        </Link>
    );
}
