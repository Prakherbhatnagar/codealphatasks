# 🛍️ ShopHive — Full-Stack E-Commerce Web Application

ShopHive is a modern, production-grade e-commerce web application featuring a vibrant frontend built with **HTML5, CSS3, and Vanilla JavaScript**, and a RESTful backend built with **Node.js, Express.js, and MongoDB (Mongoose)**.

---

## ✨ Features Overview

### 🎨 Frontend & User Experience
- **Interactive Product Catalog (`products.html`)**: Multi-category filtering, price sliders, stock status toggles, rating filters, search, sorting (price, rating, newness), and pagination.
- **Product Details View (`product.html`)**: Interactive image thumbnails, live stock badges, star rating displays, specs tab, quantity selectors, add-to-cart, and buy-now buttons.
- **Shopping Cart Engine (`cart.html`)**: Real-time itemized cart with quantity adjusters, instant price updates, coupon code discounts (`SAVE10`, `SAVE20`, `FLAT15`), free shipping threshold indicators, and tax calculation.
- **Order Checkout Flow (`checkout.html`)**: Pre-filled profile information, address input fields, payment method selector, order summary review, and order placement.
- **User Authentication (`login.html`)**: Registration & login forms with real-time validation, password strength scoring, and JWT token session management.
- **User Profile & History (`profile.html`)**: Account details management, password update forms, and full order history tracking with status badges.
- **Dynamic Header & Navigation**: Auto-updating account links, logged-in user initial badges, and responsive mobile toggle drawer.

### ⚙️ Backend & REST API
- **Authentication**: JWT authentication with HTTP-only cookies and Bearer tokens.
- **Product Management**: Filterable product search, pagination, category grouping, and detail endpoints.
- **Cart Management**: User-bound database cart persistence and item manipulation.
- **Order Processing**: Itemized order creation, price verification, shipping address validation, and user order history.
- **Database Seeding**: Built-in sample seeder for initial data initialization.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | HTML5, Vanilla CSS3 (Custom Design Tokens, Responsive Grid/Flexbox), JavaScript (ES6+) |
| **Backend** | Node.js, Express.js REST API |
| **Database** | MongoDB, Mongoose Schemas (`User`, `Product`, `Cart`, `Order`) |
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` Password Hashing, `express-validator`, `cookie-parser` |

---

## 📁 Project Directory Structure

```
CODEALPHA_EcommerceSTore/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & fallback setup
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, logout logic
│   │   ├── cartController.js     # Cart items & subtotals CRUD
│   │   ├── orderController.js    # Order creation & order history
│   │   ├── productController.js  # Product query, filter & details API
│   │   └── userController.js     # Profile retrieval & update logic
│   ├── middleware/
│   │   ├── auth.js               # JWT auth & admin guard middleware
│   │   ├── errorMiddleware.js    # Centralized error handler
│   │   └── validatorMiddleware.js# Request payload validator
│   ├── models/
│   │   ├── Cart.js               # Cart Mongoose Schema
│   │   ├── Order.js              # Order Mongoose Schema
│   │   ├── Product.js            # Product Mongoose Schema
│   │   └── User.js               # User Mongoose Schema
│   ├── routes/
│   │   ├── adminRoutes.js        # Admin dashboard API routes
│   │   ├── authRoutes.js         # Authentication routes
│   │   ├── cartRoutes.js         # Cart API routes
│   │   ├── orderRoutes.js        # Order API routes
│   │   ├── productRoutes.js      # Product API routes
│   │   └── userRoutes.js         # User profile routes
│   ├── utils/
│   │   ├── asyncHandler.js       # Express async error wrapper
│   │   ├── generateToken.js      # JWT token generator
│   │   └── seeder.js             # Initial database seeder script
│   ├── .env                      # Environment configurations
│   ├── app.js                    # Express app configuration & static file serving
│   ├── package.json              # Backend dependencies & scripts
│   └── server.js                 # Server entry point
├── ecommerce/
│   ├── css/                      # Modular CSS stylesheets
│   ├── js/
│   │   ├── api.js                # Client REST API fetch helper
│   │   ├── app.js                # Core cart/wishlist engine & header UI
│   │   ├── auth.js               # Login & registration form logic
│   │   ├── cart.js               # Shopping cart page interactions
│   │   ├── checkout.js           # Order checkout processing
│   │   ├── products.js           # Product catalog & detail page logic
│   │   ├── profile.js            # User profile & order history logic
│   │   └── validation.js         # Form field validation utilities
│   ├── index.html                # Homepage
│   ├── products.html             # Product Catalog page
│   ├── product.html              # Product Details page
│   ├── cart.html                 # Shopping Cart page
│   ├── checkout.html             # Checkout page
│   ├── login.html                # Login / Registration page
│   └── profile.html              # User Profile & Orders page
├── package.json                  # Root scripts
├── server.js                     # Root HTTP static server
└── README.md                     # Complete Project Documentation
```

---

## 📡 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new user account
- `POST /api/auth/login` — Login user & receive JWT token
- `POST /api/auth/logout` — Logout user & clear token
- `GET /api/auth/me` — Get current logged-in user info

### Products (`/api/products`)
- `GET /api/products` — Retrieve products with optional filter query parameters (`search`, `category`, `minPrice`, `maxPrice`, `sortBy`, `page`)
- `GET /api/products/:id` — Retrieve single product details by ID

### Cart (`/api/cart`)
- `GET /api/cart` — Get logged-in user's cart
- `POST /api/cart/add` — Add item to cart
- `PUT /api/cart/update` — Update item quantity in cart
- `DELETE /api/cart/remove/:productId` — Remove single item from cart
- `DELETE /api/cart/clear` — Clear entire cart

### Orders (`/api/orders`)
- `POST /api/orders` — Create new order
- `GET /api/orders/my-orders` — Get order history for current user
- `GET /api/orders/:id` — Get single order details

### User Profile (`/api/users`)
- `GET /api/users/profile` — Get user profile details
- `PUT /api/users/profile` — Update user profile information or password

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Optional: running locally on default port `27017` or configured via `MONGO_URI` in `backend/.env`)

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Prakherbhatnagar/CODEALPHA_EcommerceSTore.git
   cd CODEALPHA_EcommerceSTore
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Seed sample product and user data**:
   ```bash
   npm run seed
   ```

4. **Start the application server**:
   ```bash
   npm start
   ```
   *or from the project root:*
   ```bash
   node backend/server.js
   ```

5. **Open in browser**:
   Navigate to **[http://localhost:5000](http://localhost:5000)** in your web browser.

---

## 🔑 Demo Account Credentials

| Account Type | Email | Password |
| :--- | :--- | :--- |
| **Standard User** | `john@example.com` | `userpassword123` |
| **Admin User** | `admin@shophive.com` | `adminpassword123` |

---

## 📄 License

This project is open-source and available under the [ISC License](LICENSE).
