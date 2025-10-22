// Configuration file for environment variables
module.exports = {
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",

  // Database
  MONGODB_URI: process.env.MONGODB_URI,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // Email
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || "Printeez <noreply@printeez.com>",

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  // Rate Limiting
  RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100,

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // File Upload (for future use)
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB
};
