const mongoose = require('mongoose');

const pujaBookingSchema = new mongoose.Schema(
  {
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'SpecificPujaPackage', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    participantInfo: { type: mongoose.Schema.Types.Mixed },
    scheduledDateTime: { type: Date },
    liveKitRoomId: { type: String },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SpecificPujaBooking', pujaBookingSchema);
