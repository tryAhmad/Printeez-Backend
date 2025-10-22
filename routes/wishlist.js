const express = require("express");
const router = express.Router();
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Get user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's wishlist with populated product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         $ref: '#/components/schemas/Product'
 *                       addedAt:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: Wishlist not found
 *       500:
 *         description: Server error
 */
// GET /wishlist - get user's wishlist
router.get("/", auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id }).populate(
      "products.productId"
    );

    if (!wishlist) {
      return res.status(404).json({ error: "Wishlist not found" });
    }

    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch wishlist." });
  }
});

/**
 * @swagger
 * /api/wishlist:
 *   post:
 *     summary: Add item to wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 description: Product ID to add to wishlist
 *     responses:
 *       200:
 *         description: Item added to wishlist successfully
 *       400:
 *         description: Item already in wishlist
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
// POST /wishlist - add item to wishlist
router.post("/", auth, async (req, res) => {
  try {
    const { productId } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user._id, products: [] });
    }

    // Check if item already exists in wishlist
    const existingItem = wishlist.products.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      return res.status(400).json({ error: "Item already in wishlist" });
    }

    // Add new item
    wishlist.products.push({ productId });
    await wishlist.save();

    // Populate and return updated wishlist
    await wishlist.populate("products.productId");
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ error: "Failed to add item to wishlist." });
  }
});

/**
 * @swagger
 * /api/wishlist/{productId}:
 *   delete:
 *     summary: Remove item from wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from wishlist
 *       404:
 *         description: Wishlist or item not found
 *       500:
 *         description: Server error
 */
// DELETE /wishlist/:productId - remove item from wishlist
router.delete("/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ error: "Wishlist not found" });
    }

    const initialLength = wishlist.products.length;
    wishlist.products = wishlist.products.filter(
      (item) => item.productId.toString() !== productId
    );

    if (wishlist.products.length === initialLength) {
      return res.status(404).json({ error: "Item not found in wishlist" });
    }

    await wishlist.save();
    await wishlist.populate("products.productId");

    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ error: "Failed to remove item from wishlist." });
  }
});

/**
 * @swagger
 * /api/wishlist/clear:
 *   delete:
 *     summary: Clear entire wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist cleared successfully
 *       404:
 *         description: Wishlist not found
 *       500:
 *         description: Server error
 */
// DELETE /wishlist/clear - clear entire wishlist
router.delete("/clear", auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ error: "Wishlist not found" });
    }

    wishlist.products = [];
    await wishlist.save();

    res.json({ message: "Wishlist cleared successfully", wishlist });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear wishlist." });
  }
});

module.exports = router;
