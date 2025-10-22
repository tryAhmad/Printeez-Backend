const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

/**
 * @swagger
 * /api/analytics/sales:
 *   get:
 *     summary: Get sales analytics (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly]
 *         description: Time period for analytics
 *         example: monthly
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for custom period
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for custom period
 *     responses:
 *       200:
 *         description: Sales analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSales:
 *                   type: number
 *                 totalOrders:
 *                   type: number
 *                 averageOrderValue:
 *                   type: number
 *                 salesByStatus:
 *                   type: object
 *                 dailySales:
 *                   type: array
 *                 period:
 *                   type: string
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
// GET /analytics/sales - get sales analytics
router.get("/sales", auth, admin, async (req, res) => {
  try {
    const { period = "monthly", startDate, endDate } = req.query;

    // Calculate date range
    let dateFilter = {};
    const now = new Date();

    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else {
      switch (period) {
        case "daily":
          dateFilter.createdAt = {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          };
          break;
        case "weekly":
          const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
          dateFilter.createdAt = { $gte: weekStart };
          break;
        case "monthly":
          dateFilter.createdAt = {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
          };
          break;
        case "yearly":
          dateFilter.createdAt = {
            $gte: new Date(now.getFullYear(), 0, 1),
          };
          break;
      }
    }

    // Get orders within date range
    const orders = await Order.find(dateFilter);

    // Calculate analytics
    const totalOrders = orders.length;
    const totalSales = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Sales by status
    const salesByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + order.totalAmount;
      return acc;
    }, {});

    // Daily sales breakdown
    const dailySales = {};
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split("T")[0];
      dailySales[date] = (dailySales[date] || 0) + order.totalAmount;
    });

    res.json({
      totalSales: Math.round(totalSales * 100) / 100,
      totalOrders,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      salesByStatus,
      dailySales: Object.entries(dailySales).map(([date, amount]) => ({
        date,
        amount: Math.round(amount * 100) / 100,
      })),
      period,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sales analytics." });
  }
});

/**
 * @swagger
 * /api/analytics/products/top-selling:
 *   get:
 *     summary: Get top-selling products (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *         description: Number of products to return
 *     responses:
 *       200:
 *         description: Top-selling products data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   product:
 *                     $ref: '#/components/schemas/Product'
 *                   totalQuantitySold:
 *                     type: number
 *                   totalRevenue:
 *                     type: number
 *                   orderCount:
 *                     type: number
 */
// GET /analytics/products/top-selling - get top-selling products
router.get("/products/top-selling", auth, admin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topProducts = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          totalQuantitySold: { $sum: "$products.quantity" },
          orderCount: { $sum: 1 },
          totalRevenue: {
            $sum: { $multiply: ["$products.quantity", "$totalAmount"] },
          },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
    ]);

    res.json(
      topProducts.map((item) => ({
        product: item.product,
        totalQuantitySold: item.totalQuantitySold,
        totalRevenue: Math.round(item.totalRevenue * 100) / 100,
        orderCount: item.orderCount,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch top-selling products." });
  }
});

/**
 * @swagger
 * /api/analytics/customers:
 *   get:
 *     summary: Get customer analytics (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCustomers:
 *                   type: number
 *                 newCustomersThisMonth:
 *                   type: number
 *                 topCustomers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       customer:
 *                         type: object
 *                       totalOrders:
 *                         type: number
 *                       totalSpent:
 *                         type: number
 */
// GET /analytics/customers - get customer analytics
router.get("/customers", auth, admin, async (req, res) => {
  try {
    // Total customers
    const totalCustomers = await User.countDocuments({ isAdmin: false });

    // New customers this month
    const monthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const newCustomersThisMonth = await User.countDocuments({
      isAdmin: false,
      createdAt: { $gte: monthStart },
    });

    // Top customers by spending
    const topCustomers = await Order.aggregate([
      {
        $group: {
          _id: "$userId",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },
      {
        $project: {
          customer: {
            _id: "$customer._id",
            name: "$customer.name",
            email: "$customer.email",
          },
          totalOrders: 1,
          totalSpent: { $round: ["$totalSpent", 2] },
        },
      },
    ]);

    res.json({
      totalCustomers,
      newCustomersThisMonth,
      topCustomers,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customer analytics." });
  }
});

/**
 * @swagger
 * /api/analytics/overview:
 *   get:
 *     summary: Get dashboard overview (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalProducts:
 *                   type: number
 *                 totalOrders:
 *                   type: number
 *                 totalRevenue:
 *                   type: number
 *                 totalCustomers:
 *                   type: number
 *                 lowStockProducts:
 *                   type: array
 *                 recentOrders:
 *                   type: array
 */
// GET /analytics/overview - get dashboard overview
router.get("/overview", auth, admin, async (req, res) => {
  try {
    // Basic counts
    const [totalProducts, totalOrders, totalCustomers] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ isAdmin: false }),
    ]);

    // Total revenue
    const revenueResult = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Low stock products (stock <= 5)
    const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
      .select("name stock")
      .limit(10);

    // Recent orders (last 10)
    const recentOrders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(10)
      .select("_id totalAmount status createdAt userId");

    res.json({
      totalProducts,
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCustomers,
      lowStockProducts,
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch overview data." });
  }
});

module.exports = router;
