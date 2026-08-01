const express = require('express');
const {
  getAllUsers,
  deleteUser,
  getDashboardStats,
} = require('../controllers/userController');
const { getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require Authentication + Admin Authorization
router.use(protect, admin);

// User Management
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

// Order Management
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Admin Dashboard Analytics
router.get('/stats', getDashboardStats);

module.exports = router;
