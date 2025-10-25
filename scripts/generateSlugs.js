const mongoose = require("mongoose");
require("dotenv").config();

// Import Product model
const Product = require("../models/Product");

// Function to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
}

async function generateSlugsForProducts() {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB successfully!");

    // Find all products without slugs
    const products = await Product.find({
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
    });

    console.log(`Found ${products.length} products without slugs`);

    if (products.length === 0) {
      console.log("All products already have slugs!");
      await mongoose.disconnect();
      return;
    }

    let updated = 0;
    let skipped = 0;

    for (const product of products) {
      try {
        const slug = generateSlug(product.name);

        // Check if slug already exists (to avoid duplicates)
        const existingProduct = await Product.findOne({
          slug,
          _id: { $ne: product._id },
        });

        if (existingProduct) {
          // Add a number suffix to make it unique
          let counter = 1;
          let uniqueSlug = `${slug}-${counter}`;

          while (
            await Product.findOne({
              slug: uniqueSlug,
              _id: { $ne: product._id },
            })
          ) {
            counter++;
            uniqueSlug = `${slug}-${counter}`;
          }

          product.slug = uniqueSlug;
          console.log(
            `⚠️  Duplicate slug found. Using: ${uniqueSlug} for "${product.name}"`
          );
        } else {
          product.slug = slug;
        }

        await product.save();
        updated++;
        console.log(`✅ Updated: "${product.name}" -> ${product.slug}`);
      } catch (error) {
        console.error(`❌ Failed to update "${product.name}":`, error.message);
        skipped++;
      }
    }

    console.log("\n=== Migration Complete ===");
    console.log(`✅ Successfully updated: ${updated} products`);
    console.log(`❌ Skipped: ${skipped} products`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
generateSlugsForProducts();
