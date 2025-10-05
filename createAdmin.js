require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

// Create admin user for testing
const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@printeez.com" });
    if (existingAdmin) {
      console.log("❌ Admin user already exists!");
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: "Admin User",
      email: "admin@printeez.com",
      password: "admin123456", // Will be hashed by the pre-save middleware
      address: "123 Admin Street, Admin City",
      isAdmin: true,
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully!");
    console.log("Email: admin@printeez.com");
    console.log("Password: admin123456");
    console.log("You can use these credentials to test admin endpoints.");
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

createAdminUser();
