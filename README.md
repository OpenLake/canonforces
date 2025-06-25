# ⚔️ CanonForces

**CanonForces** is a multiplayer Codeforces companion platform built to make competitive programming more **collaborative, analytical, and fun**. Challenge friends, compare your growth, solve problems together, and sharpen your DSA skills — all in one place.


## 🚀 Features

### ✅ Live Features
- 🧩 **Practice Problems with Ratings & Tags**
- 🧠 **Built-in CP IDE** with stdin/stdout support
- 📊 **Codeforces Stats Comparison** between users (rating, problems solved, ranks, etc.)
- 📆 **Problem of the Day (POTD)** to keep consistency
- 🔍 **Explore Problems by Difficulty or Topic**
- 💬 **Direct Messaging between Users** *(planned)*

### 🧪 In Development / Planned
- ⚔️ **1v1 Contests** – Real-time battles with friends
- 🗣️ **In-app Messaging & Group Chat**


---

## 🛠️ Tech Stack

### 🖥️ Frontend
- Next.js + React
- Tailwind CSS
- ShadCN UI
- Socket.IO (real-time)

### 🗄️ Backend
- Node.js + Express
- Firebase for authentication and database
- Codeforces Public API
- Judge0 and Monoco editor

---

## 🧑‍💻 Local Development Setup

```bash
# 1. Clone the repo
git clone https://github.com/OpenLake/canonforces.git
cd canonforces

# 2. Install frontend and backend dependencies
cd client && npm install
cd ../server && npm install
