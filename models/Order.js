const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for faster user order queries
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    address: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
      index: true, // Index for filtering by status
    },
    paymentMethod: { type: String, default: "COD" },
  },
  {
    timestamps: true,
  }
);

// Compound index for user orders sorted by date
orderSchema.index({ userId: 1, createdAt: -1 });

// Index for analytics queries
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
