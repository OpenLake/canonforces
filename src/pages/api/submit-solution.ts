import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../lib/firebase_admin';
import admin from 'firebase-admin';
import { ContestSubmission } from '../../types/contest-submission';

type RequestData = {
    userId: string;
    contestId: string;
    problemId: string;
    problemName: string;
    platform: string;
    language: string;
    code: string;
};

type SuccessResponse = {
    message: string;
    coinsEarned: number;
    isFirstSubmission: boolean;
};

type ErrorResponse = {
    error: string;
};

// Coin reward for first solution submission
const COINS_PER_SOLUTION = 10;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { userId, contestId, problemId, problemName, platform, language, code }: RequestData = req.body;

    // Validate required fields
    if (!userId || !contestId || !problemId || !problemName || !platform || !language || !code) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate code length (skip for verified submissions)
    if (language !== "Verified" && code.length < 10) {
        return res.status(400).json({ error: 'Code is too short' });
    }

    if (code.length > 50000) {
        return res.status(400).json({ error: 'Code is too long (max 50KB)' });
    }

    try {
        if (!adminDb) {
            console.error('Firebase Admin SDK not initialized. Missing environment variables.');
            return res.status(503).json({ error: 'Server configuration error: Firebase Admin SDK not initialized. Please ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set in .env' });
        }

        const userRef = adminDb.collection('users').doc(userId);
        const submissionsRef = adminDb.collection('contest_submissions');

        // Check if user has already submitted this problem
        const existingSubmissions = await submissionsRef
            .where('userId', '==', userId)
            .where('problemId', '==', problemId)
            .limit(1)
            .get();

        const isFirstSubmission = existingSubmissions.empty;
        const coinsEarned = isFirstSubmission ? COINS_PER_SOLUTION : 0;

        // Create the submission document
        const submissionData: Omit<ContestSubmission, 'id'> = {
            userId,
            contestId,
            problemId,
            problemName,
            platform,
            language,
            code,
            submittedAt: admin.firestore.FieldValue.serverTimestamp(),
            coinsEarned,
        };

        // Use transaction to ensure atomic operations
        await adminDb.runTransaction(async (transaction) => {
            // 1. Check if user document exists
            const userDoc = await transaction.get(userRef);

            // 2. Create the submission document
            const newSubmissionRef = submissionsRef.doc();
            transaction.set(newSubmissionRef, submissionData);

            // 3. Award coins only if it's the first submission
            if (isFirstSubmission) {
                if (!userDoc.exists) {
                    // Create user document if it doesn't exist
                    transaction.set(userRef, {
                        coins: coinsEarned,
                        userId,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                } else {
                    // Update existing user document
                    transaction.update(userRef, {
                        coins: admin.firestore.FieldValue.increment(coinsEarned),
                    });
                }
            }
        });

        return res.status(200).json({
            message: isFirstSubmission
                ? 'Solution submitted successfully! Coins awarded.'
                : 'Solution submitted successfully! (No coins for duplicate problem)',
            coinsEarned,
            isFirstSubmission,
        });

    } catch (error) {
        console.error('Error submitting solution:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
