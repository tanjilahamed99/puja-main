const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, default: "General" },
    price: { type: Number, required: true, min: 0 },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Recurring weekly schedule
    schedule: {
      days: [
        {
          type: String,
          enum: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        },
      ],
      time: { type: String }, // "18:00"
      timezone: { type: String, default: "Asia/Dhaka" },
    },

    // NEW: how long each session runs
    durationMinutes: { type: Number, default: 60, min: 5, max: 480 },

    // NEW: join window config (per session)
    joinLeadMinutes: { type: Number, default: 10, min: 0, max: 120 },
    joinGraceMinutes: { type: Number, default: 15, min: 0, max: 120 },

    // NEW: course lifecycle
    startDate: { type: Date },
    endDate: { type: Date },
    totalSessions: { type: Number, default: 0 },
    completedSessions: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
    liveKitRoomId: { type: String },
    image: { type: String },
    syllabus: [{ type: String }],
  },
  { timestamps: true },
);

courseSchema.index({ teacher: 1, status: 1 });
courseSchema.index({ status: 1, startDate: 1 });

module.exports = mongoose.model("Course", courseSchema);