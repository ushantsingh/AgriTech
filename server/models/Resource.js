const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: ['seed', 'fertilizer', 'pesticide', 'equipment'], required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  unit: { type: String, default: 'piece' },
  image: { type: String, default: '' },
  approved: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

resourceSchema.index({ category: 1, approved: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
