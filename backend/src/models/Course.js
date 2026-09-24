const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'General' },
    price: { type: Number, required: true, min: 0 },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    schedule: {
      days: [{ type: String, enum: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }],
      time: { type: String }, // e.g. "18:00"
      timezone: { type: String, default: 'Asia/Dhaka' },
    },
    liveKitRoomId: { type: String },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft' },
    syllabus: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
