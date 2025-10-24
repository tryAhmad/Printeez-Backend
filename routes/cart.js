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
    const { productId, size, quantity } = req.body;

    console.log("Received cart request:", { productId, size, quantity });

    // Validate input
    if (!productId || !size || !quantity) {
      console.log(
        "Missing fields - productId:",
        productId,
        "size:",
        size,
        "quantity:",
        quantity
      );
      return res.status(400).json({
        error: "Missing required fields: productId, size, quantity",
      });
    }

    // Validate product exists and has sufficient stock for the size
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if product has sizes array
    if (!product.sizes || !Array.isArray(product.sizes)) {
      console.error("Product has no sizes array:", productId);
      return res.status(400).json({
        error: "Product size information is not available",
      });
    }

    // Check if size exists and has sufficient stock
    const sizeData = product.sizes.find((s) => s.size === size);
    if (!sizeData) {
      return res.status(400).json({
        error: `Size ${size} not available for this product. Available sizes: ${product.sizes
          .map((s) => s.size)
          .join(", ")}`,
      });
    }

    if (sizeData.stock < quantity) {
      return res.status(400).json({
        error: `Insufficient stock for size ${size}. Available: ${sizeData.stock}`,
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    // Sanitize legacy items (from before size was required)
    if (cart.items && cart.items.length > 0) {
      const beforeCount = cart.items.length;
      cart.items = cart.items.filter((item) => !!item.size);
      const afterCount = cart.items.length;
      if (afterCount !== beforeCount) {
        console.warn(
          `Removed ${
            beforeCount - afterCount
          } legacy cart item(s) missing size for user ${req.user._id}`
        );
      }
    }

    // Check if item with same product and size already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && item.size === size
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (sizeData.stock < newQuantity) {
        return res.status(400).json({
          error: `Cannot add more. Total would exceed available stock (${sizeData.stock})`,
        });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      const newItem = {
        productId: productId,
        size: size,
        quantity: quantity,
      };
      console.log("Adding new item to cart:", newItem);
      console.log("Type of size:", typeof size);
      console.log("Size value:", size);
      console.log("Size length:", size ? size.length : "null");
      cart.items.push(newItem);
    }

    console.log(
      "Cart items before save:",
      cart.items.map((item) => ({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
      }))
    );

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
    console.error("Error adding item to cart:", err);
    res
      .status(500)
      .json({ error: "Failed to add item to cart.", details: err.message });
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

    // Delete the cart document entirely to avoid any stale items reappearing
    await Cart.deleteOne({ _id: cart._id });

    // Respond with an empty cart payload
    res.json({
      message: "Cart cleared successfully",
      cart: {
        _id: cart._id,
        userId: cart.userId,
        items: [],
        updatedAt: new Date().toISOString(),
      },
      totalAmount: 0,
    });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ error: "Failed to clear cart." });
  }
});

module.exports = router;
