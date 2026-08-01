const express = require('express');
const { body } = require('express-validator');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validatorMiddleware');

const router = express.Router();

const productValidation = [
  body('title').notEmpty().withMessage('Product title is required'),
  body('description').notEmpty().withMessage('Product description is required'),
  body('price').isNumeric().withMessage('Price must be a valid number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('stock').isNumeric().withMessage('Stock must be a valid number'),
  validate,
];

// Public Routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin Routes
router.post(
  '/',
  protect,
  admin,
  upload.single('image'),
  productValidation,
  createProduct
);

router.put(
  '/:id',
  protect,
  admin,
  upload.single('image'),
  updateProduct
);

router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
