<div align="center">

  # ⚔️ CanonForces
  

  **The Ultimate Gamified Codeforces Companion**

  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20DB-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
  [![Redis](https://img.shields.io/badge/Redis-Queue-red?style=flat-square&logo=redis)](https://redis.io/)
  [![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)](./CONTRIBUTING.md)

  <img src="https://github.com/user-attachments/assets/9ec16061-77a0-4119-bc03-d470aaaecdd9" width="70%" alt="CanonForces Banner" />
  <br/>
  <p align="center">
    <strong>Collaborate. Compete. Conquer.</strong><br>
    Transform your competitive programming journey with real-time battles, deep analytics, and a gamified learning environment.
  </p>
</div>

---

## 🚀 About The Project

**CanonForces** is a multiplayer Codeforces companion platform designed to make competitive programming collaborative, analytical, and fun. We bridge the gap between solitary practice and community engagement by integrating powerful tools like a built-in IDE, real-time 1v1 duels, and comprehensive performance analytics.

> **New:** Now featuring full **Codeforces Synchronization**! Your submissions, stats, and solved problems are automatically synced in real-time.

---

## ✨ Key Features

### 🎮 Gamified Arena
- **1v1 Real-time Battles:** Challenge friends or get matched instantly via Redis queues. Solve problems faster to win.
- **Battle Royale Lobbies:** Join 20-30 player lobbies for intense "King of the Hill" quiz sessions.
- **Coin System:** Earn coins for every problem solved, daily streak maintained, and contest solution uploaded.

### 🛠️ Integrated Practice Suite
- **Advanced CP IDE:** Powered by **Monaco Editor** and **Judge0**. Supports C++, Python, Java, JS, and more with real stdin/stdout.
- **Codeforces Sync:** Automatically tracks your Codeforces submissions and updates your local stats.
- **Contest Archive:** View past contests and upload your own solutions to earn rewards.

### 📊 Analytics & Growth
- **Performance Dashboard:** Compare your stats (Rating, Rank, Max Streak) across Codeforces and LeetCode.
- **Problem of the Day (POTD):** Admin-curated daily challenges with streak tracking and "Daily Solver" leaderboards.
- **Global Leaderboards:** Rank up against the community based on Coins earned or Problems solved.

<div align="center">
  <img width="48%" src="https://github.com/user-attachments/assets/71bf2afe-1509-4491-9904-dcf38dfdd0ca" alt="Screenshot 1" />
  <img width="48%" alt="image" src="https://github.com/user-attachments/assets/290b7580-624e-405f-bad1-eb0a71756dca" />
  <br/>
  <img width="48%" alt="Screenshot 2025-10-23 005547" src="https://github.com/user-attachments/assets/a38702e4-4aa4-43ad-a58d-c0cb5903fcb9" />
  <img width="48%"  alt="Screenshot 2026-01-21 001638" src="https://github.com/user-attachments/assets/e6cf602e-0004-4bf6-a01f-f57394f23d64" />

</div>

---

## 🏗️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | Next.js (React), Tailwind CSS, ShadCN UI, Framer Motion |
| **Backend** | Firebase (Auth/Firestore), Node.js |
| **Real-time** | Socket.IO, Redis (Queues & Leaderboards) |
| **AI & API** | Gemini AI (Quiz Generation), Judge0 (Code Execution), Codeforces API |

---

## ⚡ Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18+)
- Firebase Account
- Redis (Optional, for local dev of 1v1 features)

### Installation

1. **Clone the repository**
```
   git clone [https://github.com/OpenLake/canonforces.git](https://github.com/OpenLake/canonforces.git)
   cd canonforces
```

## ⚙️ Configure Environment Variables

Create a `.env.local` (check .env.example for latest updates) file in the root directory and add your keys:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_JUDGE0_API_KEY=your_rapidapi_key
REDIS_URL=your_redis_url
GEMINI_API_KEY=your_ai_key
```

## ▶️ Run the Development Server

```bash
npm run dev
```

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, improving the UI, or adding new features, your help is appreciated.

- Check the **Issues** tab (look for tags like `good first issue` or `Foss Overflow`)
- Fork the project and create your feature branch:

```bash
git checkout -b feature/AmazingFeature
```
- Commit your changes:

```bash
git commit -m "Add some AmazingFeature"
```
Push it to Github
```
git push origin feature/AmazingFeature
```

And raise a PR adding @aviralsaxena16 as reviewer

## 👨‍💻 Maintainer

**Aviral Saxena**  
GitHub: [@aviralsaxena16](https://github.com/aviralsaxena16)

<div align="center">Built with ❤️ by Aviral Saxena .</div>



