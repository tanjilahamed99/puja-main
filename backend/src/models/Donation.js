const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // null/omitted = anonymous
    freeClass: { type: mongoose.Schema.Types.ObjectId, ref: "FreeClass" },
    amount: { type: Number, required: true, min: 1 },
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

donationSchema.index({ createdAt: -1 });
donationSchema.index({ status: 1, createdAt: -1 });
donationSchema.index({ method: 1, createdAt: -1 });
donationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Donation", donationSchema);
