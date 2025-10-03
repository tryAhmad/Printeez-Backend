const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { sendOrderConfirmation } = require("../services/emailService");

// POST /orders - create order
router.post("/", auth, async (req, res) => {
  try {
    const { products, address } = req.body;
    let totalAmount = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res
          .status(400)
          .json({ error: "Product unavailable or insufficient stock." });
      }
      totalAmount += product.price * item.quantity;
      orderProducts.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const order = new Order({
      userId: req.user._id,
      products,
      totalAmount,
      address,
      paymentMethod: "COD",
    });
    await order.save();

    // Reduce stock
    for (const item of products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // Get user details for email
    const user = await User.findById(req.user._id);

    // Send order confirmation email
    if (user && user.email) {
      const orderDetails = {
        orderId: order._id,
        totalAmount: totalAmount,
        paymentMethod: "COD",
        address: address,
        createdAt: order.createdAt,
        products: orderProducts,
      };

      await sendOrderConfirmation(user.email, user.name, orderDetails);
    }

    res.status(201).json(order);
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(400).json({ error: "Order creation failed." });
  }
});

// GET /orders - get user's own orders
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});

// GET /admin/orders - admin can view all orders
router.get("/admin/orders", auth, admin, async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all orders." });
  }
});

// PUT /orders/:id/status - admin updates status
router.put("/:id/status", auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: "Order not found." });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: "Failed to update order status." });
  }
});

module.exports = router;
