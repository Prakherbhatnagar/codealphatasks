const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get user's shopping cart
 * @route   GET /api/cart
 * @access  Private
 */
exports.getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {
    cart = await Cart.create({ userId: req.user._id, products: [], total: 0 });
  }

  res.status(200).json({
    success: true,
    message: 'Cart retrieved successfully',
    data: { cart },
  });
});

/**
 * @desc    Add product to cart
 * @route   POST /api/cart/add
 * @access  Private
 */
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
      data: null,
    });
  }

  if (product.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: `Requested quantity exceeds available stock (${product.stock})`,
      data: null,
    });
  }

  let cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {
    cart = new Cart({ userId: req.user._id, products: [] });
  }

  // Check if product already exists in cart
  const itemIndex = cart.products.findIndex(
    (p) => p.productId.toString() === productId
  );

  if (itemIndex > -1) {
    // Product exists, update quantity
    cart.products[itemIndex].quantity += Number(quantity);
  } else {
    // New product, push item
    cart.products.push({
      productId: product._id,
      title: product.title,
      price: product.price,
      quantity: Number(quantity),
      image: product.image,
    });
  }

  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Product added to cart successfully',
    data: { cart },
  });
});

/**
 * @desc    Update quantity of product in cart
 * @route   PUT /api/cart/update
 * @access  Private
 */
exports.updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (quantity < 1) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be at least 1',
      data: null,
    });
  }

  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found',
      data: null,
    });
  }

  const itemIndex = cart.products.findIndex(
    (p) => p.productId.toString() === productId
  );

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Product not found in cart',
      data: null,
    });
  }

  cart.products[itemIndex].quantity = Number(quantity);
  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Cart item quantity updated',
    data: { cart },
  });
});

/**
 * @desc    Remove product from cart
 * @route   DELETE /api/cart/remove/:productId
 * @access  Private
 */
exports.removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found',
      data: null,
    });
  }

  cart.products = cart.products.filter(
    (p) => p.productId.toString() !== productId
  );

  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Product removed from cart',
    data: { cart },
  });
});

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart/clear
 * @access  Private
 */
exports.clearCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user._id });
  if (cart) {
    cart.products = [];
    await cart.save();
  }

  res.status(200).json({
    success: true,
    message: 'Cart cleared successfully',
    data: { cart },
  });
});
