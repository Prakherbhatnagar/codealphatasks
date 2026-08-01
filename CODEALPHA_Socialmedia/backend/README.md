# 🚀 SocialConnect Backend API

Production-ready RESTful API backend for **SocialConnect Mini Social Media Platform**, built with **Node.js**, **Express.js**, **MongoDB (Mongoose ODM)**, and **JWT Authentication**.

---

## 📁 Directory Structure

```
backend/
├── config/             # DB & CORS configuration
├── controllers/        # Express route handlers
├── middleware/         # Auth, Upload, Error, Logger & Rate limiting
├── models/             # Mongoose schemas (User, Post, Comment, Notification, Message, Conversation)
├── routes/             # REST endpoint route definitions
├── services/           # Reusable business logic layer
├── utils/              # API Response, Async handlers, Token generators
├── validators/         # Express-validator input validation rules
├── uploads/            # Media uploads storage directory
├── tests/              # Sample API collection requests
├── app.js              # Express app pipeline
├── server.js           # Server startup script
├── package.json        # Dependencies
├── .env.example        # Environment variable template
└── README.md           # Documentation
```

---

## 🛠️ Installation & Setup

```bash
cd backend
npm install
npm run dev
```

The server will start at `http://localhost:5000`.
