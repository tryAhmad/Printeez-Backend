require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
  // Urban Category
  {
    name: "Urban Street Vibes",
    description: "Cool urban design with street style graphics",
    price: 24.99,
    category: "urban",
    size: "Small",
    stock: 50,
    imageUrl: "https://via.placeholder.com/400x400?text=Urban+Street+Small",
    salesCount: 0,
  },
  {
    name: "Urban Street Vibes",
    description: "Cool urban design with street style graphics",
    price: 24.99,
    category: "urban",
    size: "Large",
    stock: 75,
    imageUrl: "https://via.placeholder.com/400x400?text=Urban+Street+Large",
    salesCount: 0,
  },
  {
    name: "Urban Street Vibes",
    description: "Cool urban design with street style graphics",
    price: 24.99,
    category: "urban",
    size: "Extra Large",
    stock: 60,
    imageUrl: "https://via.placeholder.com/400x400?text=Urban+Street+XL",
    salesCount: 0,
  },
  {
    name: "City Lights",
    description: "Urban cityscape design with modern aesthetic",
    price: 26.99,
    category: "urban",
    size: "Small",
    stock: 40,
    imageUrl: "https://via.placeholder.com/400x400?text=City+Lights+Small",
    salesCount: 0,
  },
  {
    name: "City Lights",
    description: "Urban cityscape design with modern aesthetic",
    price: 26.99,
    category: "urban",
    size: "Large",
    stock: 65,
    imageUrl: "https://via.placeholder.com/400x400?text=City+Lights+Large",
    salesCount: 0,
  },
  {
    name: "City Lights",
    description: "Urban cityscape design with modern aesthetic",
    price: 26.99,
    category: "urban",
    size: "Extra Large",
    stock: 55,
    imageUrl: "https://via.placeholder.com/400x400?text=City+Lights+XL",
    salesCount: 0,
  },

  // Typography Category
  {
    name: "Bold Statement",
    description: "Powerful typography with motivational quote",
    price: 22.99,
    category: "typography",
    size: "Small",
    stock: 45,
    imageUrl: "https://via.placeholder.com/400x400?text=Bold+Statement+Small",
    salesCount: 0,
  },
  {
    name: "Bold Statement",
    description: "Powerful typography with motivational quote",
    price: 22.99,
    category: "typography",
    size: "Large",
    stock: 70,
    imageUrl: "https://via.placeholder.com/400x400?text=Bold+Statement+Large",
    salesCount: 0,
  },
  {
    name: "Bold Statement",
    description: "Powerful typography with motivational quote",
    price: 22.99,
    category: "typography",
    size: "Extra Large",
    stock: 50,
    imageUrl: "https://via.placeholder.com/400x400?text=Bold+Statement+XL",
    salesCount: 0,
  },
  {
    name: "Minimalist Type",
    description: "Clean and simple typography design",
    price: 21.99,
    category: "typography",
    size: "Small",
    stock: 55,
    imageUrl: "https://via.placeholder.com/400x400?text=Minimalist+Small",
    salesCount: 0,
  },
  {
    name: "Minimalist Type",
    description: "Clean and simple typography design",
    price: 21.99,
    category: "typography",
    size: "Large",
    stock: 80,
    imageUrl: "https://via.placeholder.com/400x400?text=Minimalist+Large",
    salesCount: 0,
  },
  {
    name: "Minimalist Type",
    description: "Clean and simple typography design",
    price: 21.99,
    category: "typography",
    size: "Extra Large",
    stock: 60,
    imageUrl: "https://via.placeholder.com/400x400?text=Minimalist+XL",
    salesCount: 0,
  },

  // Abstract Category
  {
    name: "Color Burst",
    description: "Abstract colorful design with geometric patterns",
    price: 25.99,
    category: "abstract",
    size: "Small",
    stock: 35,
    imageUrl: "https://via.placeholder.com/400x400?text=Color+Burst+Small",
    salesCount: 0,
  },
  {
    name: "Color Burst",
    description: "Abstract colorful design with geometric patterns",
    price: 25.99,
    category: "abstract",
    size: "Large",
    stock: 60,
    imageUrl: "https://via.placeholder.com/400x400?text=Color+Burst+Large",
    salesCount: 0,
  },
  {
    name: "Color Burst",
    description: "Abstract colorful design with geometric patterns",
    price: 25.99,
    category: "abstract",
    size: "Extra Large",
    stock: 45,
    imageUrl: "https://via.placeholder.com/400x400?text=Color+Burst+XL",
    salesCount: 0,
  },
  {
    name: "Geometric Flow",
    description: "Modern abstract with flowing geometric shapes",
    price: 27.99,
    category: "abstract",
    size: "Small",
    stock: 30,
    imageUrl: "https://via.placeholder.com/400x400?text=Geometric+Flow+Small",
    salesCount: 0,
  },
  {
    name: "Geometric Flow",
    description: "Modern abstract with flowing geometric shapes",
    price: 27.99,
    category: "abstract",
    size: "Large",
    stock: 55,
    imageUrl: "https://via.placeholder.com/400x400?text=Geometric+Flow+Large",
    salesCount: 0,
  },
  {
    name: "Geometric Flow",
    description: "Modern abstract with flowing geometric shapes",
    price: 27.99,
    category: "abstract",
    size: "Extra Large",
    stock: 40,
    imageUrl: "https://via.placeholder.com/400x400?text=Geometric+Flow+XL",
    salesCount: 0,
  },

  // Anime Category
  {
    name: "Dragon Spirit",
    description: "Epic anime-style dragon artwork",
    price: 28.99,
    category: "anime",
    size: "Small",
    stock: 40,
    imageUrl: "https://via.placeholder.com/400x400?text=Dragon+Spirit+Small",
    salesCount: 0,
  },
  {
    name: "Dragon Spirit",
    description: "Epic anime-style dragon artwork",
    price: 28.99,
    category: "anime",
    size: "Large",
    stock: 70,
    imageUrl: "https://via.placeholder.com/400x400?text=Dragon+Spirit+Large",
    salesCount: 0,
  },
  {
    name: "Dragon Spirit",
    description: "Epic anime-style dragon artwork",
    price: 28.99,
    category: "anime",
    size: "Extra Large",
    stock: 55,
    imageUrl: "https://via.placeholder.com/400x400?text=Dragon+Spirit+XL",
    salesCount: 0,
  },
  {
    name: "Kawaii Dreams",
    description: "Cute anime characters in pastel colors",
    price: 26.99,
    category: "anime",
    size: "Small",
    stock: 50,
    imageUrl: "https://via.placeholder.com/400x400?text=Kawaii+Dreams+Small",
    salesCount: 0,
  },
  {
    name: "Kawaii Dreams",
    description: "Cute anime characters in pastel colors",
    price: 26.99,
    category: "anime",
    size: "Large",
    stock: 75,
    imageUrl: "https://via.placeholder.com/400x400?text=Kawaii+Dreams+Large",
    salesCount: 0,
  },
  {
    name: "Kawaii Dreams",
    description: "Cute anime characters in pastel colors",
    price: 26.99,
    category: "anime",
    size: "Extra Large",
    stock: 60,
    imageUrl: "https://via.placeholder.com/400x400?text=Kawaii+Dreams+XL",
    salesCount: 0,
  },
  {
    name: "Samurai Legend",
    description: "Traditional Japanese warrior anime art",
    price: 29.99,
    category: "anime",
    size: "Small",
    stock: 35,
    imageUrl: "https://via.placeholder.com/400x400?text=Samurai+Legend+Small",
    salesCount: 0,
  },
  {
    name: "Samurai Legend",
    description: "Traditional Japanese warrior anime art",
    price: 29.99,
    category: "anime",
    size: "Large",
    stock: 65,
    imageUrl: "https://via.placeholder.com/400x400?text=Samurai+Legend+Large",
    salesCount: 0,
  },
  {
    name: "Samurai Legend",
    description: "Traditional Japanese warrior anime art",
    price: 29.99,
    category: "anime",
    size: "Extra Large",
    stock: 50,
    imageUrl: "https://via.placeholder.com/400x400?text=Samurai+Legend+XL",
    salesCount: 0,
  },
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Insert new products
    await Product.insertMany(products);
    console.log(`Successfully seeded ${products.length} products!`);
    console.log("Categories: urban, typography, abstract, anime");
    console.log("Sizes: Small, Large, Extra Large");

    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
}

seedProducts();
