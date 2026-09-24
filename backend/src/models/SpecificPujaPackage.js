const mongoose = require('mongoose');

const pujaPackageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    requiredInfoFields: [{ type: String }],
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SpecificPujaPackage', pujaPackageSchema);
