const mongoose = require("mongoose");

const freeClassSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    dateTime: { type: Date, required: true },

    // NEW: how long the session is expected to run
    durationMinutes: { type: Number, default: 60, min: 5, max: 480 },

    // NEW: how many minutes before start users can enter
    joinLeadMinutes: { type: Number, default: 5, min: 0, max: 60 },

    // NEW: how long after the scheduled end the room stays open (grace)
    joinGraceMinutes: { type: Number, default: 15, min: 0, max: 120 },

    liveKitRoomId: { type: String },
    image: { type: String, default: "" },

    // NEW: real session lifecycle timestamps
    startedAt: { type: Date },
    endedAt: { type: Date },

    status: {
      type: String,
      enum: ["scheduled", "live", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true },
);

// Helpful index — most list queries filter by date
freeClassSchema.index({ dateTime: 1 });
freeClassSchema.index({ teacher: 1, dateTime: -1 });

module.exports = mongoose.model("FreeClass", freeClassSchema);