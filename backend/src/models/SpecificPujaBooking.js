const mongoose = require("mongoose");

const pujaBookingSchema = new mongoose.Schema(
  {
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SpecificPujaPackage",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    participantInfo: { type: mongoose.Schema.Types.Mixed },

    // CHANGED: now required
    scheduledDateTime: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },

    // NEW: proposed vs confirmed
    proposedDateTime: { type: Date }, // what the student asked for
    confirmedDateTime: { type: Date }, // what admin/teacher locked in

    // NEW: reschedule trail (nice for audit / UX)
    rescheduleHistory: [
      {
        fromDateTime: Date,
        toDateTime: Date,
        byRole: { type: String, enum: ["student", "teacher", "admin"] },
        reason: String,
        at: { type: Date, default: Date.now },
      },
    ],

    liveKitRoomId: { type: String },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    // NEW: who confirmed it and when
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    confirmedAt: { type: Date },
    startedAt: { type: Date },
    endedAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SpecificPujaBooking", pujaBookingSchema);
