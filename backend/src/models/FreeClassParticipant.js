const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    freeClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FreeClass",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    joinedAt: { type: Date, default: Date.now },       // first join
    lastJoinedAt: { type: Date, default: Date.now },   // most recent join
    joinCount: { type: Number, default: 1 },
    leftAt: { type: Date },
  },
  { timestamps: true },
);

// One row per (class, user) — but rejoin updates it instead of failing
participantSchema.index({ freeClass: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("FreeClassParticipant", participantSchema);