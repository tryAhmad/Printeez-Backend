const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ["urban", "typography", "abstract", "anime"],
      lowercase: true,
    },
    size: {
      type: String,
      required: true,
      enum: ["Small", "Large", "Extra Large"],
    },
    stock: { type: Number, required: true, min: 0, default: 0 },
    imageUrl: { type: String, trim: true },
    salesCount: { type: Number, default: 0, min: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Indexes for better query performance
productSchema.index({ category: 1, salesCount: -1 }); // For category + top selling
productSchema.index({ createdAt: -1 }); // For new arrivals
productSchema.index({ name: "text", description: "text" }); // For text search
productSchema.index({ salesCount: -1 }); // For top selling products
productSchema.index({ price: 1 }); // For price filtering

module.exports = mongoose.model("Product", productSchema);
