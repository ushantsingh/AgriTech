const mongoose = require('mongoose');

const growthLogSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  stage: { type: String, default: '' },
  notes: { type: String, default: '' },
});

const soilHealthSchema = new mongoose.Schema({
  pH: { type: Number, min: 0, max: 14, default: 7 },
  nitrogen: { type: Number, default: 0 },       // kg/ha
  phosphorus: { type: Number, default: 0 },      // kg/ha
  potassium: { type: Number, default: 0 },       // kg/ha
  moisture: { type: Number, min: 0, max: 100, default: 50 }, // percentage
  testedAt: { type: Date, default: Date.now },
}, { _id: false });

const cropSchema = new mongoose.Schema({
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  variety: { type: String, default: '' },
  sowingDate: { type: Date, default: Date.now },
  expectedHarvest: { type: Date },
  status: { type: String, enum: ['planned', 'planted', 'growing', 'harvested'], default: 'planted' },
  soilHealth: { type: soilHealthSchema, default: () => ({}) },
  growthLogs: [growthLogSchema],
}, { timestamps: true });

module.exports = mongoose.model('Crop', cropSchema);
