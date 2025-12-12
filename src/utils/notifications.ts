// src/utils/notifications.ts

import { NotificationPayload } from "../types/notification";

/**
 * Generates a formatted notification message based on the notification type and metadata.
 * This utility function creates consistent notification messages across the application.
 * 
 * @param notification - The notification payload containing type and metadata
 * @returns A formatted string message for display
 * 
 * @example
 * ```ts
 * const message = generateNotificationMessage({
 *   type: "follow",
 *   metadata: { username: "john_doe" }
 * });
 * // Returns: "john_doe started following you"
 * ```
 */
export function generateNotificationMessage(notification: NotificationPayload): string {
    const { type, metadata = {} } = notification;

    switch (type) {
        case "follow":
            return `${metadata.username || "Someone"} started following you`;

        case "contest_reminder":
            return `Contest "${metadata.contestName || "Upcoming Contest"}" starts in ${metadata.timeRemaining || "soon"}`;

        case "problem_solved":
            return `Congratulations! You solved "${metadata.problemName || "a problem"}"`;

        case "quiz_completed":
            return `You completed the quiz "${metadata.quizName || "Quiz"}" with a score of ${metadata.score || 0}/${metadata.total || 0}`;

        case "achievement":
            return `Achievement unlocked: ${metadata.achievementName || "New Achievement"}!`;

        case "system":
            return metadata.message || "You have a new notification";

        case "unfollow":
            return `${metadata.username || "Someone"} unfollowed you`;

        case "contest_started":
            return `Contest "${metadata.contestName || "Contest"}" has started!`;

        case "contest_ended":
            return `Contest "${metadata.contestName || "Contest"}" has ended. Check your results!`;

        case "new_potd":
            return `New Problem of the Day is available: ${metadata.problemName || "Check it out"}`;

        case "friend_solved":
            return `${metadata.username || "A friend"} solved "${metadata.problemName || "a problem"}"`;

        case "leaderboard_rank":
            return `You've reached rank #${metadata.rank || "?"} on the leaderboard!`;

        default:
            return metadata.message || "You have a new notification";
    }
}

/**
 * Generates a link/route for a notification based on its type and metadata.
 * 
 * @param notification - The notification payload
 * @returns The route/link to navigate to when clicking the notification
 */
export function getNotificationLink(notification: NotificationPayload): string {
    const { type, metadata = {} } = notification;

    switch (type) {
        case "follow":
        case "unfollow":
            return metadata.userId ? `/user/${metadata.userId}` : "/dashboard";

        case "contest_reminder":
        case "contest_started":
        case "contest_ended":
            return metadata.contestId ? `/contests/${metadata.contestId}` : "/contests";

        case "problem_solved":
        case "new_potd":
            return metadata.problemId ? `/questions/${metadata.problemId}` : "/potd";

        case "quiz_completed":
            return metadata.quizId ? `/quiz/${metadata.quizId}` : "/quiz";

        case "friend_solved":
            return metadata.userId ? `/user/${metadata.userId}` : "/dashboard";

        case "leaderboard_rank":
            return "/stats";

        default:
            return "/dashboard";
    }
}
