# Notification System Documentation

## Overview

The notification system provides a full-stack solution for managing user notifications in CanonForces. It includes:

- ✅ Notification type definitions
- ✅ Utility function for generating formatted notification messages
- ✅ API endpoints for CRUD operations
- ✅ Dedicated notifications page
- ✅ Bell icon with unread badge in header
- ✅ Service layer for easy notification creation

## Features

### 1. Notification Types

The system supports the following notification types:

- `follow` - When someone follows you
- `unfollow` - When someone unfollows you
- `contest_reminder` - Reminder for upcoming contests
- `contest_started` - When a contest starts
- `contest_ended` - When a contest ends
- `problem_solved` - When you solve a problem
- `new_potd` - New Problem of the Day
- `quiz_completed` - When you complete a quiz
- `achievement` - Achievement unlocked
- `friend_solved` - When a friend solves a problem
- `leaderboard_rank` - Leaderboard rank updates
- `system` - General system notifications

### 2. Utility Function: `generateNotificationMessage()`

Located in `/src/utils/notifications.ts`, this function generates formatted notification messages.

**Usage:**
```typescript
import { generateNotificationMessage } from '../utils/notifications';

const message = generateNotificationMessage({
  type: 'follow',
  metadata: { username: 'john_doe' }
});
// Returns: "john_doe started following you"
```

### 3. API Endpoints

#### GET `/api/v1/notifications?userId=xxx`
Fetches all notifications for a user (limited to 50, ordered by newest first).

**Response:**
```json
{
  "notifications": [
    {
      "id": "notification_id",
      "userId": "user_id",
      "type": "follow",
      "message": "john_doe started following you",
      "metadata": { "username": "john_doe", "userId": "user123" },
      "link": "/user/user123",
      "read": false,
      "createdAt": 1234567890
    }
  ]
}
```

#### POST `/api/v1/notifications`
Creates a new notification.

**Request Body:**
```json
{
  "userId": "user_id",
  "type": "follow",
  "metadata": {
    "username": "john_doe",
    "userId": "user123"
  }
}
```

#### POST `/api/v1/notifications/read/:id`
Marks a specific notification as read.

#### POST `/api/v1/notifications/read-all`
Marks all notifications as read for a user.

**Request Body:**
```json
{
  "userId": "user_id"
}
```

### 4. Notifications Page

Located at `/notifications`, this page displays all user notifications with:

- Unread count display
- "Mark all as read" button
- Individual notification items with:
  - Icon based on notification type
  - Formatted message
  - Time ago (e.g., "2h ago")
  - Unread indicator (blue dot)
  - Click to navigate and mark as read
- Empty state when no notifications
- Loading and error states

### 5. Notification Bell

The bell icon appears in the header for authenticated users and shows:

- Unread notification count badge
- Pulsing animation on badge
- Auto-refresh every 30 seconds
- Click to navigate to notifications page

### 6. Service Layer

Located in `/src/services/notifications.ts`, provides helper functions:

**Creating Notifications:**
```typescript
import { createNotification, notifyUserFollowed } from '../services/notifications';

// Generic way
await createNotification(userId, 'follow', { username: 'john_doe' });

// Using helper functions
await notifyUserFollowed(targetUserId, 'john_doe', followerUserId);
await notifyProblemSolved(userId, 'Two Sum', 'problem123');
await notifyQuizCompleted(userId, 'Arrays Quiz', 'quiz123', 8, 10);
```

**Fetching and Managing:**
```typescript
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '../services/notifications';

const notifications = await getNotifications(userId);
await markNotificationAsRead(notificationId);
await markAllNotificationsAsRead(userId);
```

## Integration Examples

### Example 1: Notify on Follow

In your follow service (`/src/services/follow.ts`):

```typescript
import { notifyUserFollowed } from './notifications';

export async function followUser(currentUserId: string, targetUserId: string) {
  // ... existing follow logic ...
  
  // Send notification
  const currentUser = await getUserByUserId(currentUserId);
  await notifyUserFollowed(
    targetUserId, 
    currentUser.username, 
    currentUserId
  );
}
```

### Example 2: Notify on Problem Solved

In your problem submission handler:

```typescript
import { notifyProblemSolved } from '../services/notifications';

export async function handleProblemSubmission(userId: string, problemId: string, verdict: string) {
  if (verdict === 'ACCEPTED') {
    const problem = await getProblem(problemId);
    await notifyProblemSolved(userId, problem.name, problemId);
  }
}
```

### Example 3: Contest Reminders

You can set up a cron job or scheduled task:

```typescript
import { notifyContestReminder } from '../services/notifications';

async function sendContestReminders() {
  const upcomingContests = await getUpcomingContests();
  const users = await getAllUsers();
  
  for (const contest of upcomingContests) {
    const timeRemaining = calculateTimeRemaining(contest.startTime);
    
    if (timeRemaining === '1 hour') {
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
}
```

## Database Schema

Notifications are stored in Firestore under the `notifications` collection:

```typescript
{
  id: string;              // Auto-generated document ID
  userId: string;          // User who receives the notification
  type: string;            // Notification type
  message: string;         // Formatted message (auto-generated)
  metadata: object;        // Additional data
  link: string;            // Navigation link (auto-generated)
  read: boolean;           // Read status
  createdAt: number;       // Timestamp
}
```

## Styling

Notifications use a modern, clean design with:

- Unread notifications have a blue background (`#eff6ff`)
- Hover effects with smooth transitions
- Pulsing badge animation
- Responsive layout
- Icons for different notification types

## Future Enhancements

Potential improvements:

1. **Real-time notifications** using Firebase Realtime Database or WebSockets
2. **Push notifications** for mobile/desktop
3. **Email notifications** for important events
4. **Notification preferences** - Let users choose which notifications to receive
5. **Notification grouping** - Group similar notifications together
6. **Rich notifications** - Support for images, actions, etc.
7. **Notification history** - Archive old notifications
8. **Sound alerts** - Optional sound when new notification arrives

## Testing

To test the notification system:

1. **Create a test notification:**
```typescript
await createNotification('your_user_id', 'follow', {
  username: 'test_user',
  userId: 'test_user_id'
});
```

2. **Check the notifications page:** Navigate to `/notifications`

3. **Verify the bell icon:** Should show unread count

4. **Click a notification:** Should navigate to the appropriate page and mark as read

5. **Test "Mark all as read":** Should mark all notifications as read

## Troubleshooting

**Bell icon not showing:**
- Ensure user is authenticated
- Check browser console for errors
- Verify Firebase configuration

**Notifications not appearing:**
- Check Firestore rules allow read/write to `notifications` collection
- Verify userId matches the authenticated user
- Check API endpoint responses in Network tab

**Badge count not updating:**
- The bell polls every 30 seconds
- Refresh the page to force an update
- Check for JavaScript errors in console

## Files Created

- `/src/types/notification.ts` - Type definitions
- `/src/utils/notifications.ts` - Utility functions
- `/src/pages/api/v1/notifications.ts` - Main API endpoint
- `/src/pages/api/v1/notifications/read/[id].ts` - Mark as read endpoint
- `/src/pages/api/v1/notifications/read-all.ts` - Mark all as read endpoint
- `/src/pages/notifications.tsx` - Notifications page
- `/src/common/components/Notifications/NotificationItem.tsx` - Notification component
- `/src/common/components/Notifications/Notifications.module.css` - Notification styles
- `/src/common/components/NotificationBell/NotificationBell.tsx` - Bell icon component
- `/src/common/components/NotificationBell/NotificationBell.module.css` - Bell icon styles
- `/src/services/notifications.ts` - Service layer
- `/src/constants/routes.tsx` - Updated with NOTIFICATIONS route
- `/src/common/components/Header/Header.tsx` - Updated with bell icon

---

**Built with ❤️ for CanonForces**
