// src/common/components/Notifications/NotificationItem.tsx

import React from "react";
import Link from "next/link";
import { Notification } from "../../../types/notification";
import styles from "./Notifications.module.css";

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
}

export default function NotificationItem({
    notification,
    onMarkAsRead,
}: NotificationItemProps) {
    const handleClick = () => {
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }
    };

    const getTimeAgo = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "follow":
            case "unfollow":
                return "👤";
            case "contest_reminder":
            case "contest_started":
            case "contest_ended":
                return "🏆";
            case "problem_solved":
                return "✅";
            case "quiz_completed":
                return "📝";
            case "achievement":
                return "🎖️";
            case "new_potd":
                return "💡";
            case "friend_solved":
                return "👥";
            case "leaderboard_rank":
                return "📊";
            default:
                return "🔔";
        }
    };

    const content = (
        <div
            className={`${styles.notificationItem} ${!notification.read ? styles.unread : ""
                }`}
            onClick={handleClick}
        >
            <div className={styles.notificationIcon}>
                {getNotificationIcon(notification.type)}
            </div>
            <div className={styles.notificationContent}>
                <p className={styles.notificationMessage}>{notification.message}</p>
                <span className={styles.notificationTime}>
                    {getTimeAgo(notification.createdAt)}
                </span>
            </div>
            {!notification.read && <div className={styles.unreadDot}></div>}
        </div>
    );

    if (notification.link) {
        return <Link href={notification.link}>{content}</Link>;
    }

    return content;
}
