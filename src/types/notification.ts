// src/types/notification.ts

export interface NotificationPayload {
    type: string;
    metadata?: Record<string, any>;
}

export interface Notification {
    id: string;
    userId: string;
    type: string;
    message: string;
    read: boolean;
    createdAt: number;
    metadata?: Record<string, any>;
    link?: string;
}

export type NotificationType =
    | "follow"
    | "unfollow"
    | "contest_reminder"
    | "contest_started"
    | "contest_ended"
    | "problem_solved"
    | "new_potd"
    | "quiz_completed"
    | "achievement"
    | "friend_solved"
    | "leaderboard_rank"
    | "system";
