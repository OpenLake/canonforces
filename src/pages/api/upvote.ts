import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../lib/firebase_admin';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { solutionId, userId, action } = req.body;

    if (!solutionId || !userId || !action) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!adminDb) {
        return res.status(500).json({ message: 'Firebase Admin not initialized' });
    }

    try {
        const solutionRef = adminDb.collection('contest_submissions').doc(solutionId);

        if (action === 'upvote') {
            await solutionRef.update({
                upvotes: FieldValue.increment(1),
                upvotedBy: FieldValue.arrayUnion(userId)
            });
        } else if (action === 'downvote') {
                await solutionRef.update({
                upvotes: FieldValue.increment(-1),
                upvotedBy: FieldValue.arrayRemove(userId)
            });
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        return res.status(200).json({ message: 'Success' });
    } catch (error: any) {
        console.error('Error in /api/upvote:', error);
        return res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
}
