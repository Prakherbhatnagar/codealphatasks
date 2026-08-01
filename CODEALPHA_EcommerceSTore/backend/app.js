const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`📌 [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

const fs = require('fs');

// Serve Static Uploads Folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve Static Frontend Website
const frontendPath = path.join(__dirname, '../ecommerce');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to ShopHive E-Commerce REST API!',
    data: {
      version: '1.0.0',
      docs: '/api/products',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found: ${req.originalUrl}`,
    data: null,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
