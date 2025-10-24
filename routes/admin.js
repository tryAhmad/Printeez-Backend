const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// Apply auth and admin middleware to all routes
router.use(auth);
router.use(admin);

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get analytics data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 *       403:
 *         description: Admin access required
 */
// GET /admin/analytics - Get dashboard analytics
router.get("/analytics", async (req, res) => {
  try {
    // Total revenue
    const orders = await Order.find({});
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    // Total orders
    const totalOrders = orders.length;

    // Total products
    const totalProducts = await Product.countDocuments();

    // Total users
    const totalUsers = await User.countDocuments();

    // Recent orders (last 10)
    const recentOrders = await Order.find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    // Low stock products (total stock < 20)
    const products = await Product.find({});
    const lowStockProducts = products
      .map((product) => {
        const totalStock = product.sizes.reduce(
          (sum, size) => sum + size.stock,
          0
        );
        return { ...product.toObject(), totalStock };
      })
      .filter((product) => product.totalStock < 20)
      .sort((a, b) => a.totalStock - b.totalStock)
      .slice(0, 10);

    // Revenue by category
    const revenueByCategory = await Order.aggregate([
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$productInfo.category",
          revenue: {
            $sum: { $multiply: ["$products.quantity", "$products.price"] },
          },
        },
      },
      { $project: { category: "$_id", revenue: 1, _id: 0 } },
      { $sort: { revenue: -1 } },
    ]);

    res.json({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      totalProducts,
      totalUsers,
      recentOrders,
      lowStockProducts,
      revenueByCategory,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 */
// GET /admin/orders - Get all orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("userId", "name email")
      .populate("products.productId", "name imageUrl price")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   put:
 *     summary: Update order status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated
 */
// PUT /admin/orders/:id - Update order status
router.put("/orders/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("userId", "name email");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error("Update order error:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

/**
 * @swagger
 * /api/admin/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Product created
 */
// POST /admin/products - Create new product
router.post("/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

/**
 * @swagger
 * /api/admin/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product updated
 */
// PUT /admin/products/:id - Update product
router.put("/products/:id", async (req, res) => {
  try {
    // Clean sizes data - remove _id fields if present
    if (req.body.sizes) {
      req.body.sizes = req.body.sizes.map(({ size, stock }) => ({
        size,
        stock: Number(stock) || 0,
      }));
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("Update product error:", err);
    console.error("Error details:", err.message);
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: "Validation error: " + err.message });
    }
    res.status(500).json({ error: "Failed to update product" });
  }
});

/**
 * @swagger
 * /api/admin/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 */
// DELETE /admin/products/:id - Delete product
router.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

/**
 * @swagger
 * /api/admin/products/{id}/stock:
 *   put:
 *     summary: Update product stock
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               size:
 *                 type: string
 *               stock:
 *                 type: number
 *     responses:
 *       200:
 *         description: Stock updated
 */
// PUT /admin/products/:id/stock - Update product stock
router.put("/products/:id/stock", async (req, res) => {
  try {
    const { size, stock } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const sizeIndex = product.sizes.findIndex((s) => s.size === size);
    if (sizeIndex === -1) {
      return res.status(404).json({ error: "Size not found" });
    }

    product.sizes[sizeIndex].stock = stock;
    await product.save();

    res.json(product);
  } catch (err) {
    console.error("Update stock error:", err);
    res.status(500).json({ error: "Failed to update stock" });
  }
});

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 */
// GET /admin/users - Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     summary: Update user role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isAdmin:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User role updated
 */
// PUT /admin/users/:id/role - Update user role
router.put("/users/:id/role", async (req, res) => {
  try {
    const { isAdmin } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isAdmin },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Update user role error:", err);
    res.status(500).json({ error: "Failed to update user role" });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */
// DELETE /admin/users/:id - Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Optionally clean up user's cart, orders, wishlist
    // await Cart.deleteOne({ userId: req.params.id });
    // await Wishlist.deleteOne({ userId: req.params.id });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;
