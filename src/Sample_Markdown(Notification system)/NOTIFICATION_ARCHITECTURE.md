# Notification System Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    TRIGGER EVENTS                                    │
│  • User follows someone                                              │
│  • User solves a problem                                             │
│  • User completes a quiz                                             │
│  • Contest starts/ends                                               │
│  • Achievement unlocked                                              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                                     │
│  /src/services/notifications.ts                                      │
│                                                                       │
│  • notifyUserFollowed()                                              │
│  • notifyProblemSolved()                                             │
│  • notifyQuizCompleted()                                             │
│  • createNotification()                                              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    UTILITY FUNCTIONS                                 │
│  /src/utils/notifications.ts                                         │
│                                                                       │
│  • generateNotificationMessage() ────► Formats message               │
│  • getNotificationLink() ────────────► Generates navigation link     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API ENDPOINT                                      │
│  POST /api/v1/notifications                                          │
│                                                                       │
│  Request: { userId, type, metadata }                                 │
│  Response: { notification }                                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FIRESTORE DATABASE                                │
│  Collection: "notifications"                                         │
│                                                                       │
│  Document: {                                                         │
│    id, userId, type, message,                                        │
│    metadata, link, read, createdAt                                   │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DISPLAY TO USER                                   │
│                                                                       │
│  ┌────────────────────┐        ┌────────────────────┐               │
│  │  Bell Icon         │        │  Notifications     │               │
│  │  (Header)          │        │  Page              │               │
│  │                    │        │                    │               │
│  │  • Unread count    │───────▶│  • All notifs      │               │
│  │  • Auto-refresh    │        │  • Mark as read    │               │
│  │  • Badge animation │        │  • Navigation      │               │
│  └────────────────────┘        └────────────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Interaction

```
┌──────────────────┐
│   Header.tsx     │
│                  │
│  Contains:       │
│  NotificationBell│
└────────┬─────────┘
         │
         │ Polls every 30s
         ▼
┌──────────────────────────────────┐
│  GET /api/v1/notifications       │
│  ?userId=xxx                     │
└────────┬─────────────────────────┘
         │
         │ Returns notifications
         ▼
┌──────────────────────────────────┐
│  NotificationBell.tsx            │
│                                  │
│  • Calculates unread count       │
│  • Shows badge if > 0            │
│  • Links to /notifications       │
└──────────────────────────────────┘


┌──────────────────────────────────┐
│  /notifications page             │
│                                  │
│  Fetches notifications           │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  NotificationItem.tsx            │
│  (for each notification)         │
│                                  │
│  • Shows icon, message, time     │
│  • Unread indicator              │
│  • Click handler                 │
└────────┬─────────────────────────┘
         │
         │ On click
         ▼
┌──────────────────────────────────┐
│  POST /api/v1/notifications/     │
│  read/:id                        │
│                                  │
│  Marks as read + Navigate        │
└──────────────────────────────────┘
```

## Data Flow Example: User Follow

```
1. User A follows User B
   │
   ▼
2. followUser(userA_id, userB_id) called
   │
   ▼
3. notifyUserFollowed(userB_id, "userA_name", userA_id)
   │
   ▼
4. generateNotificationMessage({
     type: "follow",
     metadata: { username: "userA_name", userId: userA_id }
   })
   Returns: "userA_name started following you"
   │
   ▼
5. getNotificationLink({...})
   Returns: "/user/userA_id"
   │
   ▼
6. POST /api/v1/notifications
   Body: {
     userId: userB_id,
     type: "follow",
     metadata: { username: "userA_name", userId: userA_id }
   }
   │
   ▼
7. Firestore: Create document in "notifications" collection
   {
     id: "auto_generated",
     userId: userB_id,
     type: "follow",
     message: "userA_name started following you",
     metadata: { username: "userA_name", userId: userA_id },
     link: "/user/userA_id",
     read: false,
     createdAt: 1234567890
   }
   │
   ▼
8. User B sees:
   • Bell icon badge count increases
   • Notification appears in /notifications page
   • Can click to view User A's profile
```

## File Structure

```
canonforces/
├── src/
│   ├── types/
│   │   └── notification.ts ..................... Type definitions
│   │
│   ├── utils/
│   │   └── notifications.ts .................... Utility functions
│   │
│   ├── services/
│   │   └── notifications.ts .................... Service layer
│   │
│   ├── pages/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       └── notifications/
│   │   │           ├── index.ts ................ Main API (GET/POST)
│   │   │           ├── read/
│   │   │           │   └── [id].ts ............. Mark single as read
│   │   │           └── read-all.ts ............. Mark all as read
│   │   │
│   │   ├── notifications.tsx ................... Notifications page
│   │   └── test-notifications.tsx .............. Test page
│   │
│   ├── common/
│   │   └── components/
│   │       ├── Notifications/
│   │       │   ├── NotificationItem.tsx ........ Individual notification
│   │       │   └── Notifications.module.css .... Styles
│   │       │
│   │       ├── NotificationBell/
│   │       │   ├── NotificationBell.tsx ........ Bell icon
│   │       │   └── NotificationBell.module.css . Styles
│   │       │
│   │       └── Header/
│   │           └── Header.tsx .................. Updated with bell
│   │
│   ├── constants/
│   │   └── routes.tsx .......................... Updated with route
│   │
│   └── examples/
│       └── notification-integration-examples.ts  Examples
│
├── NOTIFICATION_SYSTEM.md ...................... Full documentation
└── IMPLEMENTATION_SUMMARY.md ................... Implementation summary
```

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications?userId=xxx` | Fetch all notifications |
| POST | `/api/v1/notifications` | Create new notification |
| POST | `/api/v1/notifications/read/:id` | Mark single as read |
| POST | `/api/v1/notifications/read-all` | Mark all as read |

## Notification Types

| Type | Icon | Example Message |
|------|------|-----------------|
| follow | 👤 | "john_doe started following you" |
| problem_solved | ✅ | "Congratulations! You solved 'Two Sum'" |
| quiz_completed | 📝 | "You completed 'Arrays Quiz' with 8/10" |
| contest_reminder | 🏆 | "Contest 'Div 2' starts in 1 hour" |
| achievement | 🎖️ | "Achievement unlocked: First 10 Problems!" |
| new_potd | 💡 | "New Problem of the Day: Binary Search" |
| friend_solved | 👥 | "alice solved 'Graph Problem'" |
| leaderboard_rank | 📊 | "You've reached rank #42!" |

---

**Last Updated:** December 9, 2025
