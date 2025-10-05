require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

// Mock T-shirt data
const mockTshirts = [
  {
    name: "Classic White T-Shirt",
    description:
      "A comfortable classic white cotton t-shirt perfect for everyday wear",
    price: 19.99,
    size: "M",
    stock: 50,
    imageUrl:
      "https://via.placeholder.com/300x300/ffffff/000000?text=White+Tee",
  },
  {
    name: "Black Premium Tee",
    description: "High-quality black t-shirt made from 100% organic cotton",
    price: 24.99,
    size: "L",
    stock: 30,
    imageUrl:
      "https://via.placeholder.com/300x300/000000/ffffff?text=Black+Tee",
  },
  {
    name: "Navy Blue Casual",
    description: "Relaxed fit navy blue t-shirt with a modern cut",
    price: 22.99,
    size: "S",
    stock: 25,
    imageUrl: "https://via.placeholder.com/300x300/000080/ffffff?text=Navy+Tee",
  },
  {
    name: "Graphic Print Tee",
    description: "Cool graphic print t-shirt with vintage design",
    price: 27.99,
    size: "XL",
    stock: 15,
    imageUrl:
      "https://via.placeholder.com/300x300/ff0000/ffffff?text=Graphic+Tee",
  },
  {
    name: "Striped Cotton Tee",
    description: "Classic striped t-shirt in red and white stripes",
    price: 21.99,
    size: "M",
    stock: 40,
    imageUrl:
      "https://via.placeholder.com/300x300/ff6b6b/ffffff?text=Striped+Tee",
  },
  {
    name: "Green Environmental Tee",
    description: "Eco-friendly green t-shirt made from recycled materials",
    price: 29.99,
    size: "L",
    stock: 20,
    imageUrl:
      "https://via.placeholder.com/300x300/008000/ffffff?text=Green+Tee",
  },
  {
    name: "Gray Athletic Fit",
    description: "Performance gray t-shirt perfect for workouts and sports",
    price: 25.99,
    size: "M",
    stock: 35,
    imageUrl:
      "https://via.placeholder.com/300x300/808080/ffffff?text=Gray+Athletic",
  },
  {
    name: "Purple Vintage Style",
    description: "Retro purple t-shirt with a vintage wash finish",
    price: 23.99,
    size: "S",
    stock: 18,
    imageUrl:
      "https://via.placeholder.com/300x300/800080/ffffff?text=Purple+Vintage",
  },
  {
    name: "Orange Summer Tee",
    description: "Bright orange t-shirt perfect for summer vibes",
    price: 20.99,
    size: "XL",
    stock: 28,
    imageUrl:
      "https://via.placeholder.com/300x300/ffa500/ffffff?text=Orange+Summer",
  },
  {
    name: "Pink Soft Cotton",
    description: "Ultra-soft pink cotton t-shirt with a feminine cut",
    price: 22.99,
    size: "S",
    stock: 32,
    imageUrl:
      "https://via.placeholder.com/300x300/ffc0cb/000000?text=Pink+Soft",
  },
];

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Clear existing products (optional)
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Insert mock data
    const products = await Product.insertMany(mockTshirts);
    console.log(`Successfully added ${products.length} mock T-shirts:`);

    products.forEach((product, index) => {
      console.log(
        `${index + 1}. ${product.name} - $${product.price} (${
          product.size
        }) - Stock: ${product.stock}`
      );
    });

    console.log("\n✅ Mock data seeding completed successfully!");
    console.log("You can now test your API endpoints with these products.");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the seeding function
seedProducts();
