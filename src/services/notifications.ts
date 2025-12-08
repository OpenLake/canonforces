// src/services/notifications.ts

import { Notification, NotificationPayload } from "../types/notification";

/**
 * Creates a new notification for a user
 * @param userId - The user ID to send the notification to
 * @param type - The type of notification
 * @param metadata - Additional metadata for the notification
 * @returns The created notification or null if failed
 */
export async function createNotification(
    userId: string,
    type: string,
    metadata?: Record<string, any>
): Promise<Notification | null> {
    try {
        const response = await fetch("/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId,
                type,
                metadata,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to create notification");
        }

        const data = await response.json();
        return data.notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
}

/**
 * Fetches all notifications for a user
 * @param userId - The user ID to fetch notifications for
 * @returns Array of notifications or empty array if failed
 */
export async function getNotifications(userId: string): Promise<Notification[]> {
    try {
        const response = await fetch(`/api/v1/notifications?userId=${userId}`);

        if (!response.ok) {
            throw new Error("Failed to fetch notifications");
        }

        const data = await response.json();
        return data.notifications || [];
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }
}

/**
 * Marks a notification as read
 * @param notificationId - The notification ID to mark as read
 * @returns True if successful, false otherwise
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
        const response = await fetch(`/api/v1/notifications/read/${notificationId}`, {
            method: "POST",
        });

        return response.ok;
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return false;
    }
}

/**
 * Marks all notifications as read for a user
 * @param userId - The user ID to mark all notifications as read for
 * @returns True if successful, false otherwise
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
    try {
        const response = await fetch("/api/v1/notifications/read-all", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
        });

        return response.ok;
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return false;
    }
}

// Helper functions for creating specific types of notifications

export async function notifyUserFollowed(
    targetUserId: string,
    followerUsername: string,
    followerUserId: string
) {
    return createNotification(targetUserId, "follow", {
        username: followerUsername,
        userId: followerUserId,
    });
}

export async function notifyContestReminder(
    userId: string,
    contestName: string,
    contestId: string,
    timeRemaining: string
) {
    return createNotification(userId, "contest_reminder", {
        contestName,
        contestId,
        timeRemaining,
    });
}

export async function notifyProblemSolved(
    userId: string,
    problemName: string,
    problemId: string
) {
    return createNotification(userId, "problem_solved", {
        problemName,
        problemId,
    });
}

export async function notifyQuizCompleted(
    userId: string,
    quizName: string,
    quizId: string,
    score: number,
    total: number
) {
    return createNotification(userId, "quiz_completed", {
        quizName,
        quizId,
        score,
        total,
    });
}

export async function notifyAchievement(
    userId: string,
    achievementName: string
) {
    return createNotification(userId, "achievement", {
        achievementName,
    });
}
