const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's cart with populated product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         $ref: '#/components/schemas/Product'
 *                       quantity:
 *                         type: number
 *                       addedAt:
 *                         type: string
 *                         format: date-time
 *                 totalAmount:
 *                   type: number
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Server error
 */
// GET /cart - get user's cart
router.get("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate(
      "items.productId"
    );

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((total, item) => {
      return total + item.productId.price * item.quantity;
    }, 0);

    res.json({
      ...cart.toObject(),
      totalAmount: Math.round(totalAmount * 100) / 100,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cart." });
  }
});

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
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
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 description: Product ID to add
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 description: Quantity to add
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 *       400:
 *         description: Invalid request or insufficient stock
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
// POST /cart - add item to cart
router.post("/", auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Validate product exists and has sufficient stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({ productId, quantity });
    }

    await cart.save();

    // Populate and return updated cart
    await cart.populate("items.productId");
    const totalAmount = cart.items.reduce((total, item) => {
      return total + item.productId.price * item.quantity;
    }, 0);

    res.json({
      ...cart.toObject(),
      totalAmount: Math.round(totalAmount * 100) / 100,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to add item to cart." });
  }
});

/**
 * @swagger
 * /api/cart/{productId}:
 *   put:
 *     summary: Update item quantity in cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *       400:
 *         description: Invalid quantity or insufficient stock
 *       404:
 *         description: Cart or item not found
 */
// PUT /cart/:productId - update item quantity
router.put("/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    await cart.populate("items.productId");
    const totalAmount = cart.items.reduce((total, item) => {
      return total + item.productId.price * item.quantity;
    }, 0);

    res.json({
      ...cart.toObject(),
      totalAmount: Math.round(totalAmount * 100) / 100,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update cart." });
  }
});

/**
 * @swagger
 * /api/cart/{productId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
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
 *         description: Item removed from cart
 *       404:
 *         description: Cart or item not found
 */
// DELETE /cart/:productId - remove item from cart
router.delete("/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();
    await cart.populate("items.productId");

    const totalAmount = cart.items.reduce((total, item) => {
      return total + item.productId.price * item.quantity;
    }, 0);

    res.json({
      ...cart.toObject(),
      totalAmount: Math.round(totalAmount * 100) / 100,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove item from cart." });
  }
});

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       404:
 *         description: Cart not found
 */
// DELETE /cart/clear - clear entire cart
router.delete("/clear", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: "Cart cleared successfully", cart });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear cart." });
  }
});

module.exports = router;
