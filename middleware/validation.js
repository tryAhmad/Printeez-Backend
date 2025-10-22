const Joi = require("joi");

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
    }
    next();
  };
};

// User validation schemas
const userSchemas = {
  signup: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name cannot exceed 50 characters",
      "any.required": "Name is required",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Password must be at least 6 characters",
      "any.required": "Password is required",
    }),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

// Product validation schemas
const productSchemas = {
  create: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500),
    price: Joi.number().positive().required(),
    category: Joi.string()
      .valid("urban", "typography", "abstract", "anime")
      .required(),
    size: Joi.string().valid("Small", "Large", "Extra Large").required(),
    stock: Joi.number().integer().min(0).required(),
    imageUrl: Joi.string().uri(),
  }),

  update: Joi.object({
    name: Joi.string().min(3).max(100),
    description: Joi.string().max(500),
    price: Joi.number().positive(),
    category: Joi.string().valid("urban", "typography", "abstract", "anime"),
    size: Joi.string().valid("Small", "Large", "Extra Large"),
    stock: Joi.number().integer().min(0),
    imageUrl: Joi.string().uri(),
  }).min(1),
};

// Order validation schemas
const orderSchemas = {
  create: Joi.object({
    products: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().hex().length(24).required(),
          quantity: Joi.number().integer().min(1).required(),
        })
      )
      .min(1)
      .required(),
    address: Joi.string().min(10).max(200).required(),
  }),
};

// Cart validation schemas
const cartSchemas = {
  addItem: Joi.object({
    productId: Joi.string().hex().length(24).required(),
    quantity: Joi.number().integer().min(1).max(100).required(),
  }),

  updateQuantity: Joi.object({
    quantity: Joi.number().integer().min(1).max(100).required(),
  }),
};

module.exports = {
  validate,
  userSchemas,
  productSchemas,
  orderSchemas,
  cartSchemas,
};
