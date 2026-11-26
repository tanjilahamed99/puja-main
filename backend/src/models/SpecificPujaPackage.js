const mongoose = require("mongoose");

const pujaPackageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    requiredInfoFields: [{ type: String }],

    // NEW
    durationMinutes: { type: Number, default: 60, min: 15 },
    // Human-readable hint shown to student, e.g. "Morning 6–10 AM IST"
    availabilityNote: { type: String, default: "" },
    // Optional: teacher's preferred days (0=Sun … 6=Sat) — for slot generation later
    preferredDays: [{ type: Number, min: 0, max: 6 }],
    // Optional: how far ahead a user can book
    minLeadTimeHours: { type: Number, default: 24 },
    maxLeadTimeDays: { type: Number, default: 60 },
    timezone: { type: String, default: "Asia/Kolkata" },

    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
  },
  { timestamps: true },
);

pujaPackageSchema.index({ createdAt: -1 });
pujaPackageSchema.index({ status: 1, createdAt: -1 });
pujaPackageSchema.index({ name: 1 }); // supports name prefix regex
pujaPackageSchema.index({ teacher: 1, createdAt: -1 });
pujaPackageSchema.index({ teacher: 1, status: 1 });

module.exports = mongoose.model("SpecificPujaPackage", pujaPackageSchema);
