const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ["urban", "typography", "abstract", "anime"],
      lowercase: true,
    },
    sizes: [
      {
        size: {
          type: String,
          required: true,
          enum: ["Small", "Large", "Extra Large"],
        },
        stock: {
          type: Number,
          required: true,
          min: 0,
          default: 0,
        },
        _id: false, // Disable _id for subdocuments
      },
    ],
    imageUrl: { type: String, trim: true },
    salesCount: { type: Number, default: 0, min: 0 },
    ratings: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
        },
        rating: { type: Number, required: true, min: 1, max: 5 },
        createdAt: { type: Date, default: Date.now },
        _id: false,
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Pre-save hook to generate slug from name
productSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    // Generate slug: lowercase, replace spaces with hyphens, remove special chars
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
  }
  next();
});

// Virtual to check if product is in stock (any size available)
productSchema.virtual("inStock").get(function () {
  return this.sizes && this.sizes.length > 0
    ? this.sizes.some((s) => s.stock > 0)
    : false;
});

// Virtual to get total stock across all sizes
productSchema.virtual("totalStock").get(function () {
  return this.sizes && this.sizes.length > 0
    ? this.sizes.reduce((total, s) => total + s.stock, 0)
    : 0;
});

// Virtual to get average rating
productSchema.virtual("averageRating").get(function () {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((total, r) => total + r.rating, 0);
  return (sum / this.ratings.length).toFixed(1);
});

// Virtual to get total number of ratings
productSchema.virtual("totalRatings").get(function () {
  return this.ratings ? this.ratings.length : 0;
});

// Method to get stock for a specific size
productSchema.methods.getStockForSize = function (size) {
  const sizeData = this.sizes.find((s) => s.size === size);
  return sizeData ? sizeData.stock : 0;
};

// Method to update stock for a specific size
productSchema.methods.updateStockForSize = function (size, quantity) {
  const sizeData = this.sizes.find((s) => s.size === size);
  if (sizeData) {
    sizeData.stock += quantity;
    return true;
  }
  return false;
};

// Indexes for better query performance
productSchema.index({ category: 1, salesCount: -1 }); // For category + top selling
productSchema.index({ createdAt: -1 }); // For new arrivals
productSchema.index({ name: "text", description: "text" }); // For text search
productSchema.index({ salesCount: -1 }); // For top selling products
productSchema.index({ price: 1 }); // For price filtering

// Ensure virtuals are included in JSON
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
