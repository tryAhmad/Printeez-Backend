require("dotenv").config();
const mongoose = require("mongoose");
const Order = require("./models/Order");
const User = require("./models/User");
const Product = require("./models/Product");

const createMockOrders = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Get existing users and products
    const users = await User.find();
    const products = await Product.find();

    if (users.length === 0) {
      console.log(
        "❌ No users found. Please create users first using npm run create-admin or signup."
      );
      return;
    }

    if (products.length === 0) {
      console.log(
        "❌ No products found. Please seed products first using npm run seed."
      );
      return;
    }

    console.log(`Found ${users.length} users and ${products.length} products`);

    // Clear existing orders (optional)
    await Order.deleteMany({});
    console.log("Cleared existing orders");

    // Create mock orders
    const mockOrders = [];

    // Helper function to get random items from array
    const getRandomItems = (array, count) => {
      const shuffled = array.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    // Helper function to calculate total amount
    const calculateTotal = (orderProducts) => {
      return orderProducts.reduce((total, item) => {
        const product = products.find(
          (p) => p._id.toString() === item.productId.toString()
        );
        return total + product.price * item.quantity;
      }, 0);
    };

    // Generate orders for each user
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const ordersPerUser = Math.floor(Math.random() * 3) + 1; // 1-3 orders per user

      for (let j = 0; j < ordersPerUser; j++) {
        // Select 1-4 random products for this order
        const selectedProducts = getRandomItems(
          products,
          Math.floor(Math.random() * 4) + 1
        );
        const orderProducts = selectedProducts.map((product) => ({
          productId: product._id,
          quantity: Math.floor(Math.random() * 3) + 1, // 1-3 quantity
        }));

        const totalAmount = calculateTotal(orderProducts);

        // Random order status
        const statuses = ["Pending", "Shipped", "Delivered"];
        const randomStatus =
          statuses[Math.floor(Math.random() * statuses.length)];

        // Random addresses
        const addresses = [
          "123 Main Street, New York, NY 10001",
          "456 Oak Avenue, Los Angeles, CA 90210",
          "789 Pine Road, Chicago, IL 60601",
          "321 Elm Street, Houston, TX 77001",
          "654 Maple Drive, Phoenix, AZ 85001",
          "987 Cedar Lane, Philadelphia, PA 19101",
          "147 Birch Boulevard, San Antonio, TX 78201",
          "258 Willow Way, San Diego, CA 92101",
        ];

        const mockOrder = {
          userId: user._id,
          products: orderProducts,
          totalAmount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
          address: addresses[Math.floor(Math.random() * addresses.length)],
          status: randomStatus,
          paymentMethod: "COD",
          createdAt: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ), // Random date within last 30 days
        };

        mockOrders.push(mockOrder);
      }
    }

    // Insert all mock orders
    const createdOrders = await Order.insertMany(mockOrders);
    console.log(
      `\n✅ Successfully created ${createdOrders.length} mock orders:`
    );

    // Group orders by status for summary
    const statusSummary = createdOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    console.log("\n📊 Order Status Summary:");
    Object.entries(statusSummary).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} orders`);
    });

    console.log("\n📋 Sample Orders:");
    createdOrders.slice(0, 5).forEach((order, index) => {
      const user = users.find(
        (u) => u._id.toString() === order.userId.toString()
      );
      console.log(
        `${index + 1}. Order ${order._id.toString().slice(-6)} - ${user.name}`
      );
      console.log(
        `   Status: ${order.status} | Total: $${order.totalAmount} | Items: ${order.products.length}`
      );
      console.log(`   Address: ${order.address}`);
      console.log(`   Date: ${order.createdAt.toLocaleDateString()}`);
      console.log("");
    });

    console.log("🎉 Mock orders created successfully!");
    console.log("You can now test order endpoints:");
    console.log("- GET /api/orders (user's own orders)");
    console.log("- GET /api/orders/admin/orders (all orders - admin only)");
    console.log("- PUT /api/orders/:id/status (update status - admin only)");
  } catch (error) {
    console.error("❌ Error creating mock orders:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the function
createMockOrders();
