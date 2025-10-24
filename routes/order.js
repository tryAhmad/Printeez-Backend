const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { sendOrderConfirmation } = require("../services/emailService");

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - products
 *               - address
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       description: Product ID
 *                     quantity:
 *                       type: number
 *                       minimum: 1
 *                       description: Quantity to order
 *                 example:
 *                   - productId: "60d5f484f8c8c8b8c8c8c8c8"
 *                     quantity: 2
 *                   - productId: "60d5f484f8c8c8b8c8c8c8c9"
 *                     quantity: 1
 *               address:
 *                 type: string
 *                 description: Delivery address
 *                 example: "123 Main St, City, State 12345"
 *     responses:
 *       201:
 *         description: Order created successfully (confirmation email sent)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Product unavailable or insufficient stock
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - JWT token required
 *       500:
 *         description: Server error
 */
// POST /orders - create order
router.post("/", auth, async (req, res) => {
  try {
    const { products, address } = req.body;
    let totalAmount = 0;
    const orderProducts = [];

    // Validate stock for all products and sizes
    for (const item of products) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(400).json({
          error: `Product not found: ${item.productId}`,
        });
      }

      // Find the size in the product's sizes array
      const sizeData = product.sizes.find((s) => s.size === item.size);

      if (!sizeData) {
        return res.status(400).json({
          error: `Size ${item.size} not available for ${product.name}`,
        });
      }

      if (sizeData.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name} (${item.size}). Available: ${sizeData.stock}`,
        });
      }

      totalAmount += product.price * item.quantity;
      orderProducts.push({
        productId: item.productId,
        productName: product.name,
        size: item.size,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Persist products with snapshot fields (name, price)
    const persistedProducts = orderProducts.map((p) => ({
      productId: p.productId,
      productName: p.productName,
      price: p.price,
      size: p.size,
      quantity: p.quantity,
    }));

    const order = new Order({
      userId: req.user._id,
      products: persistedProducts,
      totalAmount,
      address,
      paymentMethod: "COD",
    });
    await order.save();

    // Reduce stock for specific sizes and increment sales count
    for (const item of products) {
      await Product.findOneAndUpdate(
        {
          _id: item.productId,
          "sizes.size": item.size,
        },
        {
          $inc: {
            "sizes.$.stock": -item.quantity,
            salesCount: item.quantity,
          },
        }
      );
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

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get user's own orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized - JWT token required
 *       500:
 *         description: Server error
 */
// GET /orders - get user's own orders
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("products.productId")
      .lean();

    const userId = req.user._id;

    // Enrich each product line with snapshot fields for ease of rendering
    const enriched = orders.map((order) => ({
      ...order,
      products: order.products.map((item) => {
        return {
          ...item,
          productName:
            item.productId && typeof item.productId === "object"
              ? item.productId.name
              : undefined,
          price:
            item.productId && typeof item.productId === "object"
              ? item.productId.price
              : undefined,
          userRating: item.rating || null, // Use order-specific rating
        };
      }),
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});

/**
 * @swagger
 * /api/orders/admin/orders:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized - JWT token required
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
// GET /admin/orders - admin can view all orders
router.get("/admin/orders", auth, admin, async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all orders." });
  }
});

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Shipped, Delivered]
 *                 description: New order status
 *                 example: "Shipped"
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Failed to update order status
 *       401:
 *         description: Unauthorized - JWT token required
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
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

// POST /orders/:orderId/rate/:productId - Rate a product in a specific order
router.post("/:orderId/rate/:productId", auth, async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    const { rating } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Find the order and verify it belongs to the user
    const order = await Order.findOne({ _id: orderId, userId: req.user._id });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Verify order is delivered
    if (order.status.toLowerCase() !== "delivered") {
      return res
        .status(400)
        .json({ error: "Can only rate products from delivered orders" });
    }

    // Find the product in the order
    const productItem = order.products.find(
      (item) => item.productId.toString() === productId
    );
    if (!productItem) {
      return res.status(404).json({ error: "Product not found in this order" });
    }

    // Update the rating for this specific product in this order
    productItem.rating = rating;
    await order.save();

    // Also update the product's ratings array for overall average
    const product = await Product.findById(productId);
    if (product) {
      // Check if this specific order+user combination already has a rating
      const existingRatingIndex = product.ratings.findIndex(
        (r) =>
          r.userId.toString() === req.user._id.toString() &&
          r.orderId &&
          r.orderId.toString() === orderId
      );

      if (existingRatingIndex > -1) {
        // Update existing rating for this order
        product.ratings[existingRatingIndex].rating = rating;
        product.ratings[existingRatingIndex].createdAt = new Date();
      } else {
        // Add new rating for this order
        product.ratings.push({
          userId: req.user._id,
          orderId: orderId,
          rating,
          createdAt: new Date(),
        });
      }
      await product.save();
    }

    res.json({
      message: "Rating submitted successfully",
      rating: productItem.rating,
    });
  } catch (error) {
    console.error("Rating error:", error);
    res.status(500).json({ error: "Failed to submit rating" });
  }
});

module.exports = router;
