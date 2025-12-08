// Example: How to integrate notifications into your existing features
// This file demonstrates how to use the notification system

import {
    notifyUserFollowed,
    notifyProblemSolved,
    notifyQuizCompleted,
    notifyContestReminder,
    notifyAchievement,
    createNotification,
} from '../services/notifications';

// ============================================
// Example 1: Notify when someone follows you
// ============================================
// Add this to your follow service (e.g., src/services/follow.ts)

export async function handleFollow(currentUserId: string, targetUserId: string, currentUsername: string) {
    // Your existing follow logic here...
    // await addFollowerToDatabase(currentUserId, targetUserId);

    // Send notification to the user being followed
    await notifyUserFollowed(targetUserId, currentUsername, currentUserId);
}

// ============================================
// Example 2: Notify when user solves a problem
// ============================================
// Add this after successful problem submission

export async function handleProblemSubmission(
    userId: string,
    problemId: string,
    problemName: string,
    verdict: string
) {
    if (verdict === 'OK' || verdict === 'ACCEPTED') {
        // Send notification
        await notifyProblemSolved(userId, problemName, problemId);

        // You could also notify friends
        // const user = await getUserByUserId(userId);
        // const followers = user.followers || [];
        // for (const followerId of followers) {
        //   await createNotification(followerId, 'friend_solved', {
        //     username: user.username,
        //     userId: userId,
        //     problemName: problemName,
        //     problemId: problemId
        //   });
        // }
    }
}

// ============================================
// Example 3: Notify when quiz is completed
// ============================================
// Add this to your quiz completion handler

export async function handleQuizCompletion(
    userId: string,
    quizId: string,
    quizName: string,
    score: number,
    totalQuestions: number
) {
    // Send notification
    await notifyQuizCompleted(userId, quizName, quizId, score, totalQuestions);

    // If they got a perfect score, send achievement notification
    if (score === totalQuestions) {
        await notifyAchievement(userId, `Perfect Score on ${quizName}`);
    }
}

// ============================================
// Example 4: Contest reminders (scheduled job)
// ============================================
// This could be run as a cron job or scheduled task

export async function sendContestReminders() {
    // Get contests starting in 1 hour
    const upcomingContests = await getContestsStartingInOneHour();

    // Get all users who want contest reminders
    const users = await getAllUsers();

    for (const contest of upcomingContests) {
        for (const user of users) {
            await notifyContestReminder(
                user.userId,
                contest.name,
                contest.id,
                '1 hour'
            );
        }
    }
}

// ============================================
// Example 5: Achievement notifications
// ============================================
// Trigger achievements based on user milestones

export async function checkAndNotifyAchievements(userId: string) {
    const user = await getUserByUserId(userId);
    const stats = await getUserStats(userId);

    // Check for milestones
    if (stats.solvedProblems === 10) {
        await notifyAchievement(userId, 'First 10 Problems Solved! 🎉');
    }

    if (stats.solvedProblems === 50) {
        await notifyAchievement(userId, 'Half Century! 50 Problems Solved 🏆');
    }

    if (stats.solvedProblems === 100) {
        await notifyAchievement(userId, 'Century! 100 Problems Solved 💯');
    }

    if (stats.contestsParticipated === 1) {
        await notifyAchievement(userId, 'First Contest Completed! 🎯');
    }

    if (user.followers && user.followers.length >= 10) {
        await notifyAchievement(userId, '10 Followers! You\'re Popular 🌟');
    }
}

// ============================================
// Example 6: Custom notification
// ============================================
// For any custom notification needs

export async function sendCustomNotification(
    userId: string,
    message: string,
    link?: string
) {
    await createNotification(userId, 'system', {
        message: message,
        link: link,
    });
}

// ============================================
// Example 7: Leaderboard rank notification
// ============================================

export async function notifyLeaderboardRank(userId: string, rank: number) {
    await createNotification(userId, 'leaderboard_rank', {
        rank: rank,
    });
}

// ============================================
// Example 8: New Problem of the Day
// ============================================

export async function notifyNewPOTD(problemName: string, problemId: string) {
    // Notify all active users
    const users = await getAllActiveUsers();

    for (const user of users) {
        await createNotification(user.userId, 'new_potd', {
            problemName: problemName,
            problemId: problemId,
        });
    }
}

// ============================================
// Helper functions (implement these based on your app)
// ============================================

async function getUserByUserId(userId: string) {
    // Your implementation
    return {} as any;
}

async function getUserStats(userId: string) {
    // Your implementation
    return { solvedProblems: 0, contestsParticipated: 0 };
}

async function getContestsStartingInOneHour() {
    // Your implementation
    return [] as any[];
}

async function getAllUsers() {
    // Your implementation
    return [] as any[];
}

async function getAllActiveUsers() {
    // Your implementation
    return [] as any[];
}
