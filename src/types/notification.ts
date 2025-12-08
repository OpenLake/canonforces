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
    metadata?: Record<string, any>;
    read: boolean;
    createdAt: number;
    link?: string;
}

export type NotificationType =
    | "follow"
    | "contest_reminder"
    | "problem_solved"
    | "quiz_completed"
    | "achievement"
    | "system";
