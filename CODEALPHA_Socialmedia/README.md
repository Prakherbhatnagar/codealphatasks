# 🌐 SocialConnect — Mini Social Media Platform

A modern, full-stack, production-ready **Mini Social Media Platform** built with **HTML5, CSS3, Vanilla JavaScript** on the frontend, and **Node.js, Express.js, MongoDB (Mongoose)** on the backend.

---

## 📌 Features Breakdown

### 🎨 Frontend Features
- **User Authentication & Persistence**: Login/Register screens with password toggle, avatar upload preview, and automatic session persistence on page refresh (`F5`).
- **Interactive Feed & Composer**: Post creation with image attachment preview, hashtag extractor, emoji picker, and location tags.
- **Social Interactions**: Live post liking, comment threads with nested replies, bookmarking/saving, and share modal.
- **Explore & Creators Grid**: Category filter chips (*Design, Travel, Tech, Food, Fitness, Art*), creator cards, and masonry post layout.
- **User Profiles**: Custom cover photos, high-res avatar, bio, verified status badge, follower/following metrics, and tabbed post grid.
- **Direct Messaging**: Conversation sidebar, online status indicators, and live chat window with typing animation.
- **Notifications Hub**: Filtered notification center (*Likes, Comments, Follows, Mentions*) with unread badges.
- **Theme Engine**: Dynamic Light & Dark Mode switcher with custom CSS variables and system preferences detection.

### ⚡ Backend Features
- **MVC Architecture**: Clean separation across Models, Controllers, Services, Routes, Middlewares, and Validators.
- **JWT Security**: Access and Refresh Token authentication with Bearer token validation middleware.
- **MongoDB Schemas**: 6 data models (`User`, `Post`, `Comment`, `Notification`, `Message`, `Conversation`) with text indexing and relationships.
- **Security Hardening**: `Helmet` HTTP headers, `CORS` origin control, `express-rate-limit` brute-force protection, and `bcryptjs` password hashing.
- **Media Storage**: `Multer` file storage handling avatar, cover, and post uploads inside `/uploads`.
- **Standardized Responses**: Centralized API response wrapper (`success`, `message`, `data`/`error`) and global error handler.

---

## 📁 Project Folder Structure

```
CODEALPHA_Socialmedia/
├── index.html              # Main SPA HTML structure (Views, Modals, Topbar)
├── style.css               # Design System, Light/Dark theme tokens & responsive styles
├── script.js              # Frontend SPA logic, state management & API integration
├── serve.js                # Lightweight Node.js frontend static web server (Port 8080)
├── README.md               # Overall project documentation
│
└── backend/                # Production Express.js REST API
    ├── config/             # Database connection & CORS configuration
    ├── controllers/        # Route logic handlers (Auth, User, Post, Comment, etc.)
    ├── middleware/         # Auth, Upload, Error, Logger, and Rate limiting
    ├── models/             # Mongoose schemas (User, Post, Comment, Notification, etc.)
    ├── routes/             # REST API Endpoint routes
    ├── services/           # Reusable business logic layer
    ├── utils/              # API Response formatters & JWT token utilities
    ├── validators/         # Input validation schemas (express-validator)
    ├── uploads/            # Uploaded image media directory
    ├── tests/              # Sample API Requests (Postman compatible)
    ├── app.js              # Express app pipeline
    ├── server.js           # HTTP Server entry point
    ├── package.json        # Dependencies & NPM scripts
    └── .env.example        # Environment variables template
```

---

## 🛠️ Quick Start Guide

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (Local instance or MongoDB Atlas connection string)

---

### 1. Start the Backend API (Port 5000)

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The API will start at **`http://localhost:5000`**.  
Check health endpoint: **`http://localhost:5000/api/health`**

---

### 2. Start the Frontend Server (Port 8080)

In a new terminal window at the root project folder:

```bash
node serve.js
```

The web application will open at **`http://localhost:8080`**.

---

## 📡 REST API Endpoint Summary

| Category | Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- | :---: |
| **Auth** | `POST` | `/api/auth/register` | Register a new user | ❌ |
| **Auth** | `POST` | `/api/auth/login` | Login user & return JWT token | ❌ |
| **Auth** | `POST` | `/api/auth/logout` | Logout user | ✅ |
| **User** | `GET` | `/api/users/:id` | Fetch user profile by ID/username | ❌ |
| **User** | `PUT` | `/api/users/profile` | Update profile information | ✅ |
| **User** | `POST` | `/api/users/avatar` | Upload profile avatar picture | ✅ |
| **Posts** | `GET` | `/api/posts` | Get main feed posts (Paginated) | ❌ |
| **Posts** | `POST` | `/api/posts` | Create new post | ✅ |
| **Posts** | `POST` | `/api/posts/:id/like` | Like or unlike post | ✅ |
| **Follow** | `POST` | `/api/follow/:id` | Follow a user | ✅ |
| **Comments** | `POST` | `/api/comments` | Add comment / reply | ✅ |
| **Messages** | `POST` | `/api/messages` | Send direct message | ✅ |
| **Notifications** | `GET` | `/api/notifications` | Get user notifications list | ✅ |

---

## 🧪 Verification & Live Testing

1. Open **`http://localhost:8080`** in your browser.
2. Open **Developer Tools** (`F12`) $\rightarrow$ **Network** tab $\rightarrow$ select **Fetch/XHR**.
3. Click **Log in**, **Like a post**, or **Create a new post**.
4. You will see real-time HTTP requests sent to **`http://localhost:5000/api/...`** returning `200 OK` or `201 Created` status codes!

---

## 📄 License
Distributed under the **ISC License**. Created for CodeAlpha Social Media Platform Task.
