const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { validate, orderSchemas } = require("../middleware/validation");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { sendOrderConfirmation } = require("../services/emailService");

// POST /orders - create order (optimized with transaction simulation)
router.post(
  "/",
  auth,
  validate(orderSchemas.create),
  catchAsync(async (req, res) => {
    const { products, address } = req.body;

    // Fetch all products in one query
    const productIds = products.map((item) => item.productId);
    const availableProducts = await Product.find({
      _id: { $in: productIds },
    }).lean();

    // Create a map for quick lookup
    const productMap = new Map(
      availableProducts.map((p) => [p._id.toString(), p])
    );

    // Validate stock and calculate total
    let totalAmount = 0;
    const orderProducts = [];
    const stockUpdates = [];

    for (const item of products) {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new AppError(`Product ${item.productId} not found`, 400);
      }

      if (product.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${product.name}. Available: ${product.stock}`,
          400
        );
      }

      totalAmount += product.price * item.quantity;
      orderProducts.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
      });

      stockUpdates.push({
        updateOne: {
          filter: { _id: item.productId },
          update: {
            $inc: {
              stock: -item.quantity,
              salesCount: item.quantity,
            },
          },
        },
      });
    }

    // Create order
    const order = await Order.create({
      userId: req.user._id,
      products,
      totalAmount,
      address,
      paymentMethod: "COD",
    });

    // Update stock in bulk operation
    await Product.bulkWrite(stockUpdates);

    // Get user details for email (async, don't wait)
    User.findById(req.user._id)
      .lean()
      .then((user) => {
        if (user && user.email) {
          const orderDetails = {
            orderId: order._id,
            totalAmount,
            paymentMethod: "COD",
            address,
            createdAt: order.createdAt,
            products: orderProducts,
          };
          sendOrderConfirmation(user.email, user.name, orderDetails).catch(
            (err) => console.error("Email sending failed:", err)
          );
        }
      });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  })
);

// GET /orders - get user's own orders with pagination
router.get(
  "/",
  auth,
  catchAsync(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = Math.min(parseInt(limit), 50);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("products.productId", "name price imageUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limitNum),
      data: orders,
    });
  })
);

// GET /admin/orders - admin view all orders
router.get(
  "/admin/orders",
  auth,
  admin,
  catchAsync(async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = Math.min(parseInt(limit), 100);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("userId", "name email")
        .populate("products.productId", "name price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limitNum),
      data: orders,
    });
  })
);

// PUT /orders/:id/status - update order status (admin only)
router.put(
  "/:id/status",
  auth,
  admin,
  catchAsync(async (req, res) => {
    const { status } = req.body;

    const validStatuses = ["Pending", "Shipped", "Delivered", "Cancelled"];
    if (!status || !validStatuses.includes(status)) {
      throw new AppError(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        400
      );
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  })
);

// GET /orders/:id - get single order details
router.get(
  "/:id",
  auth,
  catchAsync(async (req, res) => {
    const order = await Order.findById(req.params.id)
      .populate("products.productId", "name price imageUrl category size")
      .populate("userId", "name email")
      .lean();

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    // Check if user owns the order or is admin
    if (order.userId._id.toString() !== req.user._id && !req.user.isAdmin) {
      throw new AppError("You are not authorized to view this order", 403);
    }

    res.json({
      success: true,
      data: order,
    });
  })
);

module.exports = router;
