// src/pages/api/v1/notifications/read/[id].ts

import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

/**
 * POST /api/v1/notifications/read/:id
 * Marks a specific notification as read
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { id } = req.query;

        if (!id || typeof id !== "string") {
            return res.status(400).json({ error: "Notification ID is required" });
        }

        const notificationRef = doc(db, "notifications", id);
        await updateDoc(notificationRef, {
            read: true,
        });

        return res.status(200).json({ success: true, message: "Notification marked as read" });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return res.status(500).json({ error: "Failed to mark notification as read" });
    }
}
