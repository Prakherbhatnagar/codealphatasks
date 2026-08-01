const express = require('express');
const { body } = require('express-validator');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');
const validate = require('../middleware/validatorMiddleware');

const router = express.Router();

router.use(protect); // All order routes require authentication

const createOrderValidation = [
  body('products').isArray({ min: 1 }).withMessage('Order products must be a non-empty array'),
  body('shippingAddress.street').notEmpty().withMessage('Shipping street is required'),
  body('shippingAddress.city').notEmpty().withMessage('Shipping city is required'),
  body('shippingAddress.zipCode').notEmpty().withMessage('Postal code is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
  validate,
];

// User Routes
router.post('/', createOrderValidation, createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);

// Admin Routes
router.get('/', admin, getAllOrders);
router.put(
  '/:id/status',
  admin,
  [
    body('orderStatus')
      .isIn(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'])
      .withMessage('Invalid order status value'),
    validate,
  ],
  updateOrderStatus
);

module.exports = router;
