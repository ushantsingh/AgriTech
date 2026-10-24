const mongoose = require('mongoose');

const forecastDaySchema = new mongoose.Schema({
  date: { type: Date },
  tempMin: Number,
  tempMax: Number,
  humidity: Number,
  description: String,
  icon: String,
}, { _id: false });

const alertSchema = new mongoose.Schema({
  type: { type: String, default: 'general' },
  message: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
}, { _id: false });

const weatherDataSchema = new mongoose.Schema({
  location: { type: String, required: true, index: true },
  temperature: Number,
  humidity: Number,
  rainfall: Number,
  windSpeed: Number,
  description: String,
  icon: String,
  forecast: [forecastDaySchema],
  alerts: [alertSchema],
}, { timestamps: true });

// Auto-expire weather data after 3 hours
weatherDataSchema.index({ createdAt: 1 }, { expireAfterSeconds: 10800 });

module.exports = mongoose.model('WeatherData', weatherDataSchema);
