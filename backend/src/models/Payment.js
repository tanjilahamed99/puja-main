const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["subscription", "specificPuja"],
      required: true,
    },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    pujaBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SpecificPujaBooking",
    },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ["paypal", "phonepe"], required: true },
    gatewayRef: { type: String },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ type: 1, status: 1, createdAt: -1 });
paymentSchema.index({ method: 1, createdAt: -1 });
paymentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
