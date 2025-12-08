// src/pages/api/v1/notifications.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../lib/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    doc,
    updateDoc,
    addDoc,
    serverTimestamp,
} from "firebase/firestore";
import { Notification } from "../../../types/notification";
import { generateNotificationMessage, getNotificationLink } from "../../../utils/notifications";

/**
 * GET /api/v1/notifications?userId=xxx
 * Fetches all notifications for a user
 * 
 * POST /api/v1/notifications
 * Creates a new notification
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "GET") {
        try {
            const { userId } = req.query;

            if (!userId || typeof userId !== "string") {
                return res.status(400).json({ error: "userId is required" });
            }

            const notificationsRef = collection(db, "notifications");
            const q = query(
                notificationsRef,
                where("userId", "==", userId),
                orderBy("createdAt", "desc"),
                limit(50)
            );

            const querySnapshot = await getDocs(q);
            const notifications: Notification[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            } as Notification));

            return res.status(200).json({ notifications });
        } catch (error) {
            console.error("Error fetching notifications:", error);
            return res.status(500).json({ error: "Failed to fetch notifications" });
        }
    }

    if (req.method === "POST") {
        try {
            const { userId, type, metadata } = req.body;

            if (!userId || !type) {
                return res.status(400).json({ error: "userId and type are required" });
            }

            // Generate message and link using utility functions
            const message = generateNotificationMessage({ type, metadata });
            const link = getNotificationLink({ type, metadata });

            const notificationData = {
                userId,
                type,
                message,
                metadata: metadata || {},
                link,
                read: false,
                createdAt: Date.now(),
            };

            const docRef = await addDoc(collection(db, "notifications"), notificationData);

            return res.status(201).json({
                success: true,
                notification: { id: docRef.id, ...notificationData },
            });
        } catch (error) {
            console.error("Error creating notification:", error);
            return res.status(500).json({ error: "Failed to create notification" });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
