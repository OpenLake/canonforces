// src/pages/api/v1/notifications/read-all.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../../lib/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    writeBatch,
} from "firebase/firestore";

/**
 * POST /api/v1/notifications/read-all
 * Marks all notifications as read for a user
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        const notificationsRef = collection(db, "notifications");
        const q = query(
            notificationsRef,
            where("userId", "==", userId),
            where("read", "==", false)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return res.status(200).json({ success: true, message: "No unread notifications" });
        }

        // Use batch write for better performance
        const batch = writeBatch(db);
        querySnapshot.docs.forEach((doc) => {
            batch.update(doc.ref, { read: true });
        });

        await batch.commit();

        return res.status(200).json({
            success: true,
            message: `Marked ${querySnapshot.size} notifications as read`,
        });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
}
