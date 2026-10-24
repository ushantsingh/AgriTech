const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  location: {
    district: { type: String, default: '' },
    state: { type: String, default: '' },
    coordinates: { lat: Number, lng: Number },
  },
  size: { type: Number, required: true },
  sizeUnit: { type: String, enum: ['acres', 'hectares', 'bigha'], default: 'acres' },
  soilType: { type: String, enum: ['clay', 'sandy', 'loamy', 'silt', 'peat', 'chalky', 'other'], default: 'loamy' },
  waterSource: { type: String, enum: ['well', 'canal', 'rain', 'river', 'borewell', 'other'], default: 'well' },
}, { timestamps: true });

module.exports = mongoose.model('Farm', farmSchema);
