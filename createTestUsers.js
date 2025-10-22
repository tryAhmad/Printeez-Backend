require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

// Create multiple test users for orders
const createTestUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Check if users already exist
    const existingUsers = await User.find({
      email: { $in: ["john@test.com", "jane@test.com", "mike@test.com"] },
    });
    if (existingUsers.length > 0) {
      console.log("❌ Test users already exist!");
      return;
    }

    const testUsers = [
      {
        name: "John Doe",
        email: "john@test.com",
        password: "password123",
        isAdmin: false,
      },
      {
        name: "Jane Smith",
        email: "jane@test.com",
        password: "password123",
        isAdmin: false,
      },
      {
        name: "Mike Johnson",
        email: "mike@test.com",
        password: "password123",
        isAdmin: false,
      },
      {
        name: "Sarah Wilson",
        email: "sarah@test.com",
        password: "password123",
        isAdmin: false,
      },
    ];

    const createdUsers = await User.insertMany(testUsers);
    console.log(`✅ Created ${createdUsers.length} test users:`);
    createdUsers.forEach((user) => {
      console.log(`- ${user.name} (${user.email})`);
    });

    console.log("\nPassword for all test users: password123");
    console.log("You can use these accounts to test user-specific orders.");
  } catch (error) {
    console.error("❌ Error creating test users:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

createTestUsers();
