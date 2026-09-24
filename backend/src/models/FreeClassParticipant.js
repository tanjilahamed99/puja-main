const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema(
  {
    freeClass: { type: mongoose.Schema.Types.ObjectId, ref: 'FreeClass', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

participantSchema.index({ freeClass: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('FreeClassParticipant', participantSchema);
