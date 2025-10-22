const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { validate, productSchemas } = require("../middleware/validation");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// GET /products/category/:category - get products by category (must be before /:id)
router.get(
  "/category/:category",
  catchAsync(async (req, res) => {
    const validCategories = ["urban", "typography", "abstract", "anime"];
    const category = req.params.category.toLowerCase();

    if (!validCategories.includes(category)) {
      throw new AppError(
        "Invalid category. Must be one of: urban, typography, abstract, anime",
        400
      );
    }

    const products = await Product.find({ category }).lean().select("-__v");

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  })
);

// GET /products/top-selling - get top selling products
router.get(
  "/top-selling",
  catchAsync(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50

    const products = await Product.find()
      .sort({ salesCount: -1 })
      .limit(limit)
      .lean()
      .select("-__v");

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  })
);

// GET /products/new-arrivals - get new arrival products
router.get(
  "/new-arrivals",
  catchAsync(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const days = parseInt(req.query.days) || 30;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const products = await Product.find({
      createdAt: { $gte: cutoffDate },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .select("-__v");

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  })
);

// GET /products/search - search products (optimized with text index)
router.get(
  "/search",
  catchAsync(async (req, res) => {
    const {
      q,
      minPrice,
      maxPrice,
      size,
      category,
      page = 1,
      limit = 20,
    } = req.query;

    if (!q) {
      throw new AppError("Search query (q) is required", 400);
    }

    // Build search criteria
    let searchCriteria = {
      $text: { $search: q }, // Use text index for better performance
    };

    // Add price filters
    if (minPrice || maxPrice) {
      searchCriteria.price = {};
      if (minPrice) searchCriteria.price.$gte = Number(minPrice);
      if (maxPrice) searchCriteria.price.$lte = Number(maxPrice);
    }

    // Add size filter
    if (size) {
      searchCriteria.size = size;
    }

    // Add category filter
    if (category) {
      const validCategories = ["urban", "typography", "abstract", "anime"];
      if (validCategories.includes(category.toLowerCase())) {
        searchCriteria.category = category.toLowerCase();
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = Math.min(parseInt(limit), 50);

    const [products, total] = await Promise.all([
      Product.find(searchCriteria)
        .lean()
        .select("-__v")
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(searchCriteria),
    ]);

    res.json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limitNum),
      data: products,
    });
  })
);

// GET /products - list all products with pagination
router.get(
  "/",
  catchAsync(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      category,
      size,
      sort = "-createdAt",
    } = req.query;

    // Build filter
    const filter = {};
    if (category) filter.category = category.toLowerCase();
    if (size) filter.size = size;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = Math.min(parseInt(limit), 50);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .lean()
        .select("-__v")
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limitNum),
      data: products,
    });
  })
);

// GET /products/:id - get single product
router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id).lean().select("-__v");

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    res.json({
      success: true,
      data: product,
    });
  })
);

// POST /products - create product (admin only)
router.post(
  "/",
  auth,
  admin,
  validate(productSchemas.create),
  catchAsync(async (req, res) => {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  })
);

// PUT /products/:id - update product (admin only)
router.put(
  "/:id",
  auth,
  admin,
  validate(productSchemas.update),
  catchAsync(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  })
);

// DELETE /products/:id - delete product (admin only)
router.delete(
  "/:id",
  auth,
  admin,
  catchAsync(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  })
);

module.exports = router;
