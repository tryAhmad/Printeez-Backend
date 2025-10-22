const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validate, userSchemas } = require("../middleware/validation");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
// Signup with validation
router.post(
  "/signup",
  validate(userSchemas.signup),
  catchAsync(async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new AppError("Email already registered", 400);
    }

    // Create new user
    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  })
);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
// Login with validation
router.post(
  "/login",
  validate(userSchemas.login),
  catchAsync(async (req, res) => {
    const { email, password } = req.body;

    // Find user and include password field (it's excluded by default)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Check password using the model method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      success: true,
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  })
);

module.exports = router;
