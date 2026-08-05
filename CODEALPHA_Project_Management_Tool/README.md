# TaskPulse - Collaborative Project Management Tool (Trello / Asana Clone)

TaskPulse is a modern, full-stack, collaborative project management application designed for high-performing engineering and product teams. It features a sleek SaaS interface with dark/light mode, a drag-and-drop Kanban board, real-time WebSocket notifications, threaded task comments with `@mentions`, Multer file attachment uploads, JWT authentication, and an Express.js + MongoDB backend.

---

## 🌟 Key Features

### 🔐 Authentication & Access Control
- **JWT Authentication** with password hashing via `bcryptjs`.
- **Demo Mode**: 1-Click login presets for instant evaluation (Project Manager, Developer, Designer).
- **User Profiles**: Custom avatars, bio, role management, and dark/light theme persistence.

### 📊 SaaS Dashboard & Metrics
- **Executive Overview**: Total projects, active tasks count, completed task progress bars, and velocity analytics.
- **Assigned Tasks**: Quick view of tasks assigned specifically to the logged-in user.
- **Project Progress**: Real-time completion percentage calculations based on total tasks vs. completed tasks.

### 📋 Interactive Drag-and-Drop Kanban Board
- **4 Status Columns**: To Do, In Progress, Review, Completed.
- **Fluid Drag-and-Drop**: Built-in HTML5 drag-and-drop state synchronization.
- **Task Cards**: Priority badges (Low, Medium, High, Urgent), due date highlights, labels, comment count, and assignee avatar stacks.

### 💬 Threaded Comments & @Mentions
- Real-time comment threads on task cards.
- Automatic `@Name` mention detection that dispatches instant real-time notifications to mentioned team members.

### 🔔 Real-Time Notifications (Socket.IO)
- Instant live alerts for task assignments, task updates, new comments, and project invitations.
- Floating toast popups + top navigation bell dropdown with unread badge counter.

### 📎 Attachment Uploads (Multer)
- Secure file attachment uploads per task card.
- Supports download links and metadata tags.

---

## 🛠️ Tech Stack

- **Frontend**: React.js 18, Vite, Tailwind CSS v3, Lucide Icons, Axios, React Router v6, Socket.IO Client.
- **Backend**: Node.js, Express.js, Socket.IO Server, Multer (File Uploads), JWT, Bcrypt.js, CORS, Dotenv.
- **Database**: MongoDB / Mongoose (with automatic embedded `MongoMemoryServer` fallback for 100% out-of-the-box readiness without requiring pre-installed MongoDB services).

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Run Backend Server
```bash
cd server
npm start
```
*The Express.js + Socket.IO server will start at `http://localhost:5000` and automatically seed demo data.*

### 3. Run Frontend App
```bash
cd client
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 🔑 Demo Credentials

| Role | Email | Password |
| --- | --- | --- |
| **Project Manager** | `alex@codealpha.io` | `password123` |
| **Developer** | `sarah@codealpha.io` | `password123` |
| **Designer** | `david@codealpha.io` | `password123` |

---

## 🌐 API Route Reference

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT token)
- `GET /api/auth/me` - Get current authenticated user profile
- `PUT /api/auth/profile` - Update user settings & theme
- `GET /api/projects` - Get all user projects with calculated progress
- `POST /api/projects` - Create new project
- `GET /api/tasks` - Get tasks (filterable by project, priority, status, assignee)
- `POST /api/tasks` - Create new task card
- `PATCH /api/tasks/:id/move` - Move task status & position (triggers WebSockets)
- `POST /api/tasks/:id/attachments` - Upload file attachment (Multer)
- `POST /api/comments` - Create comment with `@mentions` parsing
- `GET /api/notifications` - Fetch live notifications and unread count
