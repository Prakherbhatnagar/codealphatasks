# 🌐 SocialConnect — Mini Social Media Platform

> **CodeAlpha Task 2** — A full-stack social media web application built with HTML, CSS, JavaScript (frontend) and Express.js + MongoDB (backend).

---

## 📋 Task Requirements Fulfilled

| Requirement | Status |
|:---|:---:|
| User Profiles | ✅ |
| Posts & Comments | ✅ |
| Like / Follow System | ✅ |
| Frontend: HTML, CSS, JavaScript | ✅ |
| Backend: Express.js | ✅ |
| Database: Users, Posts, Comments, Followers | ✅ |

---

## 🚀 Quick Start

### 1. Start the Backend (Port 5000)
```bash
cd backend
npm install
npm run dev
```

### 2. Start the Frontend (Port 8080)
```bash
# In a new terminal — from project root
node serve.js
```

### 3. Open in Browser
```
http://localhost:8080
```

---

## 📁 Complete Project Structure

```
CODEALPHA_Socialmedia/
│
├── 📄 index.html               # Main SPA — all views/pages in one file
├── 🎨 style.css                # Complete stylesheet (900+ lines, dark/light theme)
├── ⚙️  script.js               # App logic — API calls, routing, interactions
├── 🖥️  serve.js                # Node.js static file server (port 8080)
├── 📖 README.md                # This file
│
└── 📂 backend/
    ├── 🚀 server.js            # Entry point — starts Express on port 5000
    ├── ⚙️  app.js              # Express app setup, middleware, route registration
    ├── 📄 package.json         # Dependencies & npm scripts
    ├── 🔒 .env                 # Environment variables (JWT secret, MongoDB URI)
    ├── 📄 .env.example         # Template for .env setup
    │
    ├── 📂 config/
    │   ├── db.js               # MongoDB connection via Mongoose
    │   └── corsOptions.js      # CORS allowed origins config
    │
    ├── 📂 models/              # Mongoose schemas (MongoDB collections)
    │   ├── User.js             # users — name, email, password, followers[], following[]
    │   ├── Post.js             # posts — caption, image, likes[], comments[], hashtags[]
    │   ├── Comment.js          # comments — text, user, post, parentComment (replies), likes[]
    │   ├── Notification.js     # notifications — type, sender, recipient, message, isRead
    │   ├── Message.js          # messages — sender, receiver, message, conversationId
    │   └── Conversation.js     # conversations — participants[], lastMessage
    │
    ├── 📂 controllers/         # Request handlers (thin layer — calls services)
    │   ├── authController.js   # register, login, logout, changePassword, forgotPassword
    │   ├── userController.js   # getProfile, updateProfile, searchUsers, getSaved
    │   ├── postController.js   # createPost, getPosts, getById, update, delete, like, save
    │   ├── commentController.js# createComment, getComments, update, delete, likeComment
    │   ├── followController.js # followUser, unfollowUser, getFollowers, getFollowing
    │   ├── notificationController.js # getNotifications, markRead, markAllRead
    │   └── messageController.js      # sendMessage, getConversations, getMessages
    │
    ├── 📂 routes/              # Express route definitions
    │   ├── authRoutes.js       # POST /api/auth/register|login|logout|change-password
    │   ├── userRoutes.js       # GET|PUT /api/users/:id, /api/users/search, /api/users/saved
    │   ├── postRoutes.js       # CRUD /api/posts, /api/posts/:id/like|save
    │   ├── commentRoutes.js    # POST|GET|PUT|DELETE /api/comments, /api/comments/:id/like
    │   ├── followRoutes.js     # POST|DELETE /api/follow/:id, GET /api/followers|following/:id
    │   ├── notificationRoutes.js # GET /api/notifications, PUT /api/notifications/read-all
    │   └── messageRoutes.js    # POST /api/messages, GET /api/messages/conversations
    │
    ├── 📂 middleware/          # Express middleware functions
    │   ├── authMiddleware.js   # JWT token verification (protect, admin)
    │   ├── uploadMiddleware.js # Multer — handles image file uploads → /uploads/
    │   ├── validationMiddleware.js # express-validator error response handler
    │   ├── errorMiddleware.js  # Global error handler (500 responses)
    │   ├── notFoundMiddleware.js   # 404 handler for unknown routes
    │   └── loggerMiddleware.js # HTTP request logger (morgan)
    │
    ├── 📂 services/            # Business logic layer (between controllers and models)
    │   ├── authService.js      # registerUser (dupe check), loginUser (password verify)
    │   ├── userService.js      # getUserProfile, updateUserProfile, searchUsers
    │   ├── postService.js      # toggleLikePost (add/remove like in DB)
    │   └── notificationService.js # createNotification (called on follow/like/comment)
    │
    ├── 📂 validators/          # Input validation rules (express-validator)
    │   ├── authValidator.js    # Validate register/login fields
    │   ├── userValidator.js    # Validate profile update fields
    │   ├── postValidator.js    # Validate post caption, visibility
    │   └── commentValidator.js # Validate comment text
    │
    ├── 📂 utils/               # Reusable utility functions
    │   ├── apiResponse.js      # sendSuccess(res, 200, msg, data) / sendError(res, 400, msg)
    │   ├── asyncHandler.js     # Wraps async route handlers to catch errors automatically
    │   └── generateToken.js    # generateAccessToken(id) / generateRefreshToken(id)
    │
    ├── 📂 tests/
    │   └── sampleRequests.json # Sample API request bodies for testing
    │
    └── 📂 uploads/             # Auto-created — stores user-uploaded images
```

---

## 🔌 API Endpoints Reference

### Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|:---|:---|:---:|:---|
| POST | `/auth/register` | ❌ | Create new account |
| POST | `/auth/login` | ❌ | Login, returns JWT token |
| POST | `/auth/logout` | ✅ | Logout (invalidate session) |
| POST | `/auth/change-password` | ✅ | Change password |
| POST | `/auth/forgot-password` | ❌ | Send reset link |
| POST | `/auth/reset-password` | ❌ | Reset with token |

### Users — `/api/users`
| Method | Endpoint | Auth | Description |
|:---|:---|:---:|:---|
| GET | `/users/:id` | ❌ | Get user profile |
| PUT | `/users/profile` | ✅ | Update own profile |
| GET | `/users/search?q=` | ❌ | Search users by name/username |
| GET | `/users/saved` | ✅ | Get saved/bookmarked posts |

### Posts — `/api/posts`
| Method | Endpoint | Auth | Description |
|:---|:---|:---:|:---|
| GET | `/posts` | ❌ | Get feed (paginated) |
| POST | `/posts` | ✅ | Create post (with image upload) |
| GET | `/posts/trending` | ❌ | Get trending posts |
| GET | `/posts/:id` | ❌ | Get single post |
| PUT | `/posts/:id` | ✅ | Edit own post |
| DELETE | `/posts/:id` | ✅ | Delete own post |
| POST | `/posts/:id/like` | ✅ | Like / unlike post |
| POST | `/posts/:id/save` | ✅ | Save post to bookmarks |
| DELETE | `/posts/:id/save` | ✅ | Remove from bookmarks |

### Comments — `/api/comments`
| Method | Endpoint | Auth | Description |
|:---|:---|:---:|:---|
| POST | `/comments` | ✅ | Add comment to a post |
| GET | `/comments/:postId` | ❌ | Get all comments for a post |
| PUT | `/comments/:id` | ✅ | Edit own comment |
| DELETE | `/comments/:id` | ✅ | Delete own comment |
| POST | `/comments/:id/like` | ✅ | Like a comment |

### Follow — `/api`
| Method | Endpoint | Auth | Description |
|:---|:---|:---:|:---|
| POST | `/follow/:id` | ✅ | Follow a user |
| DELETE | `/follow/:id` | ✅ | Unfollow a user |
| GET | `/followers/:id` | ❌ | Get a user's followers |
| GET | `/following/:id` | ❌ | Get who a user is following |

### Notifications — `/api/notifications`
| Method | Endpoint | Auth | Description |
|:---|:---|:---:|:---|
| GET | `/notifications` | ✅ | Get all notifications |
| PUT | `/notifications/read-all` | ✅ | Mark all as read |

### Messages — `/api/messages`
| Method | Endpoint | Auth | Description |
|:---|:---|:---:|:---|
| POST | `/messages` | ✅ | Send a message |
| GET | `/messages/conversations` | ✅ | List all conversations |
| GET | `/messages/:conversationId` | ✅ | Get messages in a conversation |

---

## 🗄️ Database Collections

| Collection | Key Fields |
|:---|:---|
| **users** | name, username, email, password (bcrypt hashed), profileImage, coverImage, bio, followers[], following[], savedPosts[], isVerified |
| **posts** | author (ref: User), caption, image (path), hashtags[], likes[] (ref: User), comments[] (ref: Comment), visibility |
| **comments** | post (ref: Post), user (ref: User), text, parentComment (ref: Comment — replies), likes[] |
| **notifications** | sender (ref: User), recipient (ref: User), type (like/comment/follow), message, isRead |
| **messages** | sender (ref: User), receiver (ref: User), message, conversationId (ref: Conversation) |
| **conversations** | participants[] (ref: User), lastMessage |

---

## 🎨 Frontend Pages

| Page | Description |
|:---|:---|
| **Login / Register** | Auth screens with form validation, password visibility toggle |
| **Home (Feed)** | Real posts from DB, like/comment/share/save actions, post composer |
| **Explore** | Search users, trending posts, follow creators |
| **Profile** | User info, posts grid, followers/following counts |
| **Messages** | Conversations list, real-time-style chat window |
| **Notifications** | Filter by type (likes/comments/follows), mark all read |
| **Bookmarks** | Saved posts from DB |
| **Settings** | Theme toggle (light/dark), account settings |

---

## 🛠️ Tech Stack

| Layer | Technology |
|:---|:---|
| **Frontend** | HTML5, CSS3 (custom properties, grid, flexbox), Vanilla JavaScript (ES2022) |
| **Backend** | Node.js, Express.js 4.x |
| **Database** | MongoDB + Mongoose ODM |
| **Auth** | JWT (access + refresh tokens), bcryptjs password hashing |
| **File Upload** | Multer (multipart/form-data → saved to `/uploads/`) |
| **Security** | Helmet, CORS, express-rate-limit (100 req/15min) |
| **Dev Tools** | nodemon (auto-restart), dotenv (env config) |

---

## ⚙️ Environment Variables (`.env`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/socialconnect
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

## 📦 Backend Dependencies

```json
{
  "express": "^4.19.2",
  "mongoose": "^8.3.1",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "multer": "^1.4.5-lts.1",
  "helmet": "^7.1.0",
  "cors": "^2.8.5",
  "express-rate-limit": "^7.2.0",
  "express-validator": "^7.0.1",
  "dotenv": "^16.4.5",
  "morgan": "^1.10.0",
  "nodemon": "^3.1.0"
}
```
