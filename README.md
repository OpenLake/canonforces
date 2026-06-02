<div align="center">


# ⚔️ CanonForces

**The Ultimate Gamified Codeforces Companion**
<p align="center">

  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
  </a>

  <a href="https://firebase.google.com/">
    <img src="https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-orange?style=for-the-badge&logo=firebase" alt="Firebase"/>
  </a>

  <a href="https://redis.io/">
    <img src="https://img.shields.io/badge/Redis-Queues-red?style=for-the-badge&logo=redis" alt="Redis"/>
  </a>
  
  <a href="https://deepmind.google/technologies/gemini/">
    <img src="https://img.shields.io/badge/Gemini-AI%20Powered-4285F4?style=for-the-badge&logo=google" alt="Gemini AI"/>
  </a>

  <a href="https://judge0.com/">
    <img src="https://img.shields.io/badge/Judge0-Code%20Execution-green?style=for-the-badge" alt="Judge0"/>
  </a>

  <a href="./CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge" alt="PRs Welcome"/>
  </a>

  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="MIT License"/>
  </a>
</p>

<img src="https://github.com/user-attachments/assets/9ec16061-77a0-4119-bc03-d470aaaecdd9" width="80%" alt="CanonForces Banner" />

<br/>

> **Collaborate. Compete. Conquer.**
>
> Transform your competitive programming journey with real-time battles, deep analytics, AI-powered hints, and a gamified ecosystem — all in one platform.

<br/>

</div>

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Screenshots](#-screenshots)
- [System Architecture](#️-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#️-environment-variables)
- [API Reference](#-api-reference)
- [Maintainers](#️-maintainers)

---

## 🚀 About the Project

**CanonForces** is a full-stack multiplayer competitive programming platform built on top of the Codeforces ecosystem. It bridges the gap between isolated practice and community engagement by combining a powerful in-browser IDE, real-time PvP battles, AI-assisted learning, and deep cross-platform analytics.


**Why CanonForces?**

- Your Codeforces submissions and rating history sync automatically
- Challenge friends or random opponents to real-time 1v1 coding duels
- Compare your Codeforces *and* LeetCode stats side-by-side with visual charts
- Stay consistent with daily POTD challenges, streaks, and leaderboards
- Track upcoming contests across Codeforces, LeetCode, CodeChef, AtCoder, and HackerEarth in one feed

---

## 📸 Screenshots

<div align="center">

| Practice Arena | CP IDE with AI Hints  |
|---|---|
| <img src="https://github.com/user-attachments/assets/71bf2afe-1509-4491-9904-dcf38dfdd0ca" width="100%"/> | <img src="https://github.com/user-attachments/assets/290b7580-624e-405f-bad1-eb0a71756dca" width="100%"/> |

| Performance Analytics and 1v1 comparisons | Global Leaderboard |
|---|---|
| <img src="https://github.com/user-attachments/assets/a38702e4-4aa4-43ad-a58d-c0cb5903fcb9" width="100%"/> | <img src="https://github.com/user-attachments/assets/e6cf602e-0004-4bf6-a01f-f57394f23d64" width="100%"/> |

</div>


## ✨ Key Features

### Gamified Arena

| Feature | Description |
|---|---|
| **1v1 Real-time Battles** | Challenge friends or get matched instantly via Redis-backed queues. Both players solve the same problem — fastest correct solution wins coins. |
| **Battle Royale Lobbies** | 20–30 player "King of the Hill" quiz sessions powered by Gemini-generated questions. |
| **Coin & Streak System** | Earn coins for every problem solved, POTD completed, daily streak maintained, or past contest solution uploaded. |
| **Global Leaderboard** | Multi-tiered: "Top Earners" (coins) and "Top Solvers" (problems). Includes a weekly POTD-specific board and a sticky "My Rank" footer for users outside the top 50. |

### Integrated Practice Suite

| Feature | Description |
|---|---|
| **Full CP IDE** | Monaco Editor + Judge0 API. Multi-language support: C++, Python, Java, JavaScript, TypeScript, C#. Real stdin/stdout, test case runner. |
| **AI Hint System** | Gemini-powered progressive hints inside the IDE. Hints reveal incrementally and reduce the coin reward — encouraging you to try first. |
| **Rating-wise Problem Explorer** | Browse Codeforces problems filtered by difficulty band (800–1600+). Track per-rating and overall solve progress. |
| **Practice Mode** | Progress bars, solved-problem tracking saved to Firestore, and a UI optimized for deep-focus sessions. |

### Analytics & Growth

| Feature | Description |
|---|---|
| **Performance Dashboard** | Aggregates rating, rank, max rating, problems solved, and submissions from both Codeforces and LeetCode. |
| **Head-to-Head Comparison** | Enter any Codeforces handle to see a rating progression chart capped to your own contest count. |
| **PDF Export** | Download a full personal analytics report as a PDF. |
| **Problem-of-the-Day (POTD)** | Auto-rotates daily based on a reference date. Admins can override. Solving POTD increments your streak and awards coins. |

### Social & Discovery

| Feature | Description |
|---|---|
| **Cross-Platform Contest Feed** | Unified upcoming contest calendar for Codeforces, LeetCode, CodeChef, AtCoder, and HackerEarth. |
| **Contest Archive & Solution Upload** | Submit your code to past contest problems. A correct submission triggers the coin reward system. |
| **Follow / Following** | Discover and follow other competitive programmers. See suggestions in the sidebar. |
| **User Profiles** | Profile photos (Cloudinary), handle linkage, activity, rank, and an expandable stats card. |


---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                         │
│         Next.js 14 · Tailwind CSS · ShadCN UI · Framer Motion  │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP / WebSocket
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
  ┌───────────────┐  ┌──────────────┐  ┌────────────────┐
  │  Next.js API  │  │  Socket.IO   │  │  Firebase Auth │
  │  Routes       │  │  Server      │  │  (Google/Email)│
  └───────┬───────┘  └──────┬───────┘  └────────┬───────┘
          │                 │                   │
          ▼                 ▼                   ▼
  ┌───────────────┐  ┌──────────────┐  ┌────────────────┐
  │  Firestore DB │  │  Redis       │  │  Cloudinary    │
  │  (Users,      │  │  (Matchmak-  │  │  (Profile      │
  │   Problems,   │  │   ing queues,│  │   Photos)      │
  │   POTD, Coins)│  │   Leaderbd.) │  └────────────────┘
  └───────────────┘  └──────────────┘
          │
          ▼
  ┌──────────────────────────────────────────┐
  │              External APIs               │
  │  Codeforces API · LeetCode API           │
  │  Judge0 (Code Execution)                 │
  │  Gemini AI (Hints & Quiz Generation)     │
  │  Contest APIs (CF, LC, CC, AC, HE)       │
  └──────────────────────────────────────────┘
```



## 🧰 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | SSR, routing, API routes |
| **Language** | TypeScript (76.6%) | Type safety across the codebase |
| **Styling** | Tailwind CSS + ShadCN UI | Utility-first design system |
| **Auth** | Firebase Authentication | Google OAuth + Email/Password |
| **Database** | Firestore (Firebase) | Users, problems, POTD, coins, sessions |
| **Real-time** | Socket.IO | Live 1v1 battle state synchronization |
| **Queue / Cache** | Redis | Matchmaking queues, leaderboard sorting |
| **Code Execution** | Judge0 API (via RapidAPI) | Multi-language sandbox execution |
| **Code Editor** | Monaco Editor | VS Code-grade in-browser editor |
| **AI** | Gemini AI (Google) | Progressive hints + quiz generation |
| **File Storage** | Cloudinary | Profile photo upload and delivery |
| **Containerization** | Docker | Consistent local and production environments |
| **Testing** | Jest | Unit and integration tests |
| **External APIs** | Codeforces API, LeetCode API, Contest APIs | Stats sync, problem data, contest calendar |

---

## 📁 Project Structure

```
canonforces/
├── .github/                    # GitHub Actions workflows, issue templates
├── public/                     # Static assets (icons, images, fonts)
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages: login, signup
│   │   ├── (dashboard)/        # Protected dashboard layout
│   │   │   ├── home/           # Home feed, follow suggestions
│   │   │   ├── stats/          # Analytics dashboard (CF + LC)
│   │   │   ├── practise/       # Practice arena, rating-wise explorer
│   │   │   ├── potd/           # Problem of the Day
│   │   │   ├── contests/       # Cross-platform contest calendar
│   │   │   ├── leaderboard/    # Global & POTD leaderboards
│   │   │   ├── quiz/           # Battle Royale lobby + 1v1 duels
│   │   │   └── profile/        # User profile, edit, photo upload
│   │   └── api/                # Next.js API routes
│   │       ├── auth/           # Auth helpers (CF handle linking)
│   │       ├── battle/         # Battle session management
│   │       ├── hints/          # Gemini hint generation endpoint
│   │       ├── judge/          # Judge0 proxy (code execution)
│   │       ├── leaderboard/    # Coin/solver ranking endpoints
│   │       ├── potd/           # Daily problem assignment
│   │       └── stats/          # CF/LC stats aggregation
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # ShadCN base components
│   │   ├── ide/                # Monaco Editor wrapper, test runner
│   │   ├── charts/             # Recharts rating line charts, bar charts
│   │   ├── leaderboard/        # Leaderboard table, rank badge
│   │   ├── problem/            # Problem card, difficulty tag
│   │   └── layout/             # Sidebar, navbar, footer
│   ├── lib/                    # Core utilities and service wrappers
│   │   ├── firebase/           # Firestore helpers, auth config
│   │   ├── redis/              # Redis client, queue helpers
│   │   ├── codeforces/         # CF API client (rating, problems, submissions)
│   │   ├── leetcode/           # LC API client (stats, problems)
│   │   ├── gemini/             # Gemini AI client (hints, quiz gen)
│   │   ├── judge0/             # Judge0 submission + polling
│   │   └── cloudinary/         # Upload helpers
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts          # Firebase auth state
│   │   ├── useBattle.ts        # Socket.IO battle state
│   │   └── useLeaderboard.ts   # Real-time leaderboard polling
│   ├── types/                  # TypeScript type definitions
│   └── constants/              # App-wide constants (difficulty bands, etc.)
├── tests/                      # Jest test suites
├── .env.example                # Environment variable template
├── Dockerfile                  # Docker configuration
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** v9+
- **Firebase** project (free Spark plan works)
- **Redis** — optional for local dev, required for 1v1 matchmaking
- **Judge0** API key via [RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce)
- **Gemini** API key from [Google AI Studio](https://makersuite.google.com/)

### Local Setup

**1. Clone the repository**

```bash
git clone https://github.com/OpenLake/canonforces.git
cd canonforces
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

```bash
cp .env.example .env.local
```

Fill in your keys — see [Environment Variables](#️-environment-variables) below.

**4. Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Docker Setup

```bash
docker build -t canonforces .
docker run -p 3000:3000 --env-file .env.local canonforces
```

### Running Tests

```bash
npm test              # run all tests
npm test -- --watch   # watch mode
npm test -- --coverage
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory. All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

```env
# ─── Firebase ──────────────────────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# ─── Code Execution (Judge0 via RapidAPI) ──────────────────
NEXT_PUBLIC_JUDGE0_API_KEY=your_rapidapi_key

# ─── Real-time & Queues ────────────────────────────────────
REDIS_URL=redis://localhost:6379        # or your Redis Cloud URL

# ─── AI (Google Gemini) ────────────────────────────────────
GEMINI_API_KEY=your_gemini_api_key

# ─── File Storage (Cloudinary) ─────────────────────────────
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

> **Tip:** For local development without Redis, 1v1 matchmaking and real-time leaderboard updates will be unavailable. All other features work without it.

---

## 🔌 API Reference

All API routes live under `/src/app/api/`. Key endpoints:

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/stats/codeforces?handle=` | Fetch rating, rank, and submission history for a CF handle |
| `GET` | `/api/stats/leetcode?handle=` | Fetch LeetCode stats for a given username |
| `GET` | `/api/potd` | Get today's Problem of the Day |
| `POST` | `/api/potd/solve` | Mark POTD as solved, award coins and increment streak |
| `POST` | `/api/judge/submit` | Proxy a code submission to Judge0 and return the verdict |
| `POST` | `/api/hints` | Request a progressive AI hint for a given problem |
| `GET` | `/api/leaderboard` | Get top earners and top solvers lists |
| `GET` | `/api/contests` | Fetch upcoming contests across all platforms |
| `POST` | `/api/battle/create` | Create a new 1v1 battle session |
| `POST` | `/api/battle/join` | Join an existing battle via invite code |

---

<details>
  <summary><b>Click to expand Feature Deep Dives</b></summary>

  
### -> AI Hint System

The IDE integrates a Gemini-powered hint engine designed to teach rather than reveal. Hints are tiered:

1. **Hint 1 — Topic**: Names the algorithmic category (e.g., "Binary Search on Answer")
2. **Hint 2 — Approach**: Describes the high-level strategy without implementation detail
3. **Hint 3 — Algorithm**: Outlines the algorithm step-by-step, but leaves the code to you

Each revealed hint reduces the coin reward for that problem. This creates a deliberate trade-off between getting unstuck and maximising your score.

### ->  Real-time 1v1 Matchmaking

Built on Redis queues + Socket.IO:

- User joins the matchmaking queue (`LPUSH` to Redis)
- Server polls the queue; when 2 players are available, it pops them and creates a battle session
- Both clients receive a `match-found` event and are directed to the same battle room
- Problem is fetched from the Codeforces API and rendered in the split-pane IDE
- Submissions are evaluated by Judge0; the first accepted solution ends the match
- Coins are atomically credited to the winner via a Firestore transaction

### -> Cross-Platform Stats Dashboard

The analytics page aggregates data from two sources:

- **Codeforces API** — rating history, max rating, rank, contest count, submission count, problem tags
- **LeetCode API** (unofficial) — solved count by difficulty, submission calendar

All data is displayed with Recharts visualizations: rating line charts, bar charts by problem tag, donut charts for difficulty breakdown. Users can also compare head-to-head with any other Codeforces handle, with the x-axis capped to the logged-in user's contest count for a fair comparison.

### -> Problem of the Day (POTD)

POTD uses a deterministic daily rotation based on a reference date, so no cron jobs or admin action is required. Admins can override the daily problem via a protected UI. Solving POTD within the day:

- Increments your daily streak
- Awards coins (scaled by difficulty rating)
- Appears on the weekly POTD leaderboard
</details>


---

## 🛡️ Maintainers

<table>
  <tr>
    <td align="center">
      <strong>Aviral Saxena</strong><br/>
      <a href="https://github.com/aviralsaxena16">@aviralsaxena16</a>
    </td>
    <td align="center">
      <strong>Kamireddi Jaswanth Kumar</strong><br/>
      <a href="https://github.com/Jaswanth-Kumar-2007">@Jaswanth-Kumar-2007</a>
    </td>
  </tr>
</table>

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.

---

<div align="center">

**⭐ Star this repo if CanonForces has helped your CP journey!**

Built with ❤️ by Aviral Saxena @ Openlake

</div>
