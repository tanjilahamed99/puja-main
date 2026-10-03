const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },

    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },

    startDate: { type: Date },
    completedAt: { type: Date },
    certificate: { type: mongoose.Schema.Types.ObjectId, ref: "Certificate" },

    // NEW: attendance-based progress
    sessionsAttended: { type: Number, default: 0 },
    sessionsMissed: { type: Number, default: 0 },

    // NEW: latest session joined (for resume UX)
    lastJoinedAt: { type: Date },
  },
  { timestamps: true },
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model("Enrollment", enrollmentSchema);