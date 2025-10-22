const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

/**
 * @swagger
 * /api/products/category/{category}:
 *   get:
 *     summary: Get T-shirts by category
 *     tags: [Products]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [urban, typography, abstract, anime]
 *         description: Product category
 *     responses:
 *       200:
 *         description: List of T-shirts in category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid category
 *       500:
 *         description: Server error
 */
// GET /products/category/:category - get products by category
router.get("/category/:category", async (req, res) => {
  try {
    const validCategories = ["urban", "typography", "abstract", "anime"];
    const category = req.params.category.toLowerCase();

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error:
          "Invalid category. Must be one of: urban, typography, abstract, anime",
      });
    }

    const products = await Product.find({ category });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products by category." });
  }
});

/**
 * @swagger
 * /api/products/top-selling:
 *   get:
 *     summary: Get top selling T-shirts
 *     tags: [Products]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *         description: Number of top selling products to return
 *     responses:
 *       200:
 *         description: List of top selling T-shirts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 */
// GET /products/top-selling - get top selling products
router.get("/top-selling", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await Product.find().sort({ salesCount: -1 }).limit(limit);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch top selling products." });
  }
});

/**
 * @swagger
 * /api/products/new-arrivals:
 *   get:
 *     summary: Get new arrival T-shirts
 *     tags: [Products]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *         description: Number of new arrivals to return
 *       - in: query
 *         name: days
 *         schema:
 *           type: number
 *           default: 30
 *         description: Number of days to consider as "new"
 *     responses:
 *       200:
 *         description: List of new arrival T-shirts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 */
// GET /products/new-arrivals - get new arrival products
router.get("/new-arrivals", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 30;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const products = await Product.find({
      createdAt: { $gte: cutoffDate },
    })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch new arrivals." });
  }
});

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Search T-shirts by name or description
 *     tags: [Products]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query for product name or description
 *         example: "shirt"
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: size
 *         schema:
 *           type: string
 *         description: Size filter (Small, Large, Extra Large)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [urban, typography, abstract, anime]
 *         description: Category filter
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       400:
 *         description: Search query required
 *       500:
 *         description: Server error
 */
// GET /products/search - search products
router.get("/search", async (req, res) => {
  try {
    const { q, minPrice, maxPrice, size, category } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Search query (q) is required" });
    }

    // Build search criteria
    let searchCriteria = {
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    };

    // Add price filters
    if (minPrice || maxPrice) {
      searchCriteria.price = {};
      if (minPrice) searchCriteria.price.$gte = Number(minPrice);
      if (maxPrice) searchCriteria.price.$lte = Number(maxPrice);
    }

    // Add size filter
    if (size) {
      searchCriteria.size = { $regex: size, $options: "i" };
    }

    // Add category filter
    if (category) {
      const validCategories = ["urban", "typography", "abstract", "anime"];
      if (validCategories.includes(category.toLowerCase())) {
        searchCriteria.category = category.toLowerCase();
      }
    }

    const products = await Product.find(searchCriteria);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Search failed." });
  }
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all T-shirts
 *     tags: [Products]
 *     security: []
 *     responses:
 *       200:
 *         description: List of all T-shirts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 */
// GET /products - list all T-shirts
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products." });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get single T-shirt by ID
 *     tags: [Products]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
// GET /products/:id - get single T-shirt
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found." });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product." });
  }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Add new T-shirt (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - size
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               size:
 *                 type: string
 *               stock:
 *                 type: number
 *               imageUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Failed to add product
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
// POST /products - add new T-shirt (admin only)
router.post("/", auth, admin, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: "Failed to add product." });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update T-shirt (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               size:
 *                 type: string
 *               stock:
 *                 type: number
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Failed to update product
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 */
// PUT /products/:id - update product (admin only)
router.put("/:id", auth, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product) return res.status(404).json({ error: "Product not found." });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: "Failed to update product." });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete T-shirt (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product deleted."
 *       400:
 *         description: Failed to delete product
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 */
// DELETE /products/:id - delete product (admin only)
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found." });
    res.json({ message: "Product deleted." });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete product." });
  }
});

module.exports = router;
