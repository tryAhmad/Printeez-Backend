require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// MongoDB connection options for better performance
const mongooseOptions = {
  maxPoolSize: 10, // Maximum number of connections in the pool
  minPoolSize: 5, // Minimum number of connections in the pool
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
};

// Connect to MongoDB with retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI,
      mongooseOptions
    );
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("🔄 Retrying connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// MongoDB connection event handlers
mongoose.connection.on("connected", () => {
  console.log("📡 Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("📴 Mongoose disconnected from MongoDB");
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("💤 Process terminated!");
  });
});

process.on("SIGINT", () => {
  console.log("👋 SIGINT received. Shutting down gracefully...");
  server.close(() => {
    console.log("💤 Process terminated!");
  });
});
