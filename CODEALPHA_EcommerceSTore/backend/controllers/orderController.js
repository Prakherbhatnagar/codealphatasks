const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Create new order & deduct product stock
 * @route   POST /api/orders
 * @access  Private
 */
exports.createOrder = asyncHandler(async (req, res) => {
  const { products, shippingAddress, paymentMethod } = req.body;

  if (!products || products.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No order items provided',
      data: null,
    });
  }

  // Validate stock and prepare order items
  const orderItems = [];
  let totalPrice = 0;

  for (const item of products) {
    const product = await Product.findById(item.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${item.productId} not found`,
        data: null,
      });
    }

    if (product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for product "${product.title}". Available: ${product.stock}, Requested: ${item.quantity}`,
        data: null,
      });
    }

    // Deduct Stock
    product.stock -= item.quantity;
    await product.save();

    const itemTotal = product.price * item.quantity;
    totalPrice += itemTotal;

    orderItems.push({
      productId: product._id,
      title: product.title,
      quantity: item.quantity,
      price: product.price,
      image: product.image,
    });
  }

  // Create Order Document
  const order = await Order.create({
    userId: req.user._id,
    products: orderItems,
    shippingAddress,
    paymentMethod: paymentMethod || 'Cash on Delivery',
    totalPrice,
    orderStatus: 'Pending',
  });

  // Clear User Cart after successful order placement
  const cart = await Cart.findOne({ userId: req.user._id });
  if (cart) {
    cart.products = [];
    await cart.save();
  }

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: { order },
  });
});

/**
 * @desc    Get logged in user's order history
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    message: 'User orders retrieved successfully',
    data: { orders },
  });
});

/**
 * @desc    Get single order details by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'userId',
    'name email phone'
  );

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
      data: null,
    });
  }

  // Authorize: user can view their own order, admin can view any order
  if (
    order.userId._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this order',
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Order details retrieved successfully',
    data: { order },
  });
});

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'All orders retrieved successfully',
    data: { count: orders.length, orders },
  });
});

/**
 * @desc    Update order status (Admin)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
      data: null,
    });
  }

  // Handle Cancellation (Restore product stock)
  if (orderStatus === 'Cancelled' && order.orderStatus !== 'Cancelled') {
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }
  }

  // Handle Delivery Timestamp
  if (orderStatus === 'Delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  order.orderStatus = orderStatus;
  await order.save();

  res.status(200).json({
    success: true,
    message: `Order status updated to '${orderStatus}'`,
    data: { order },
  });
});
