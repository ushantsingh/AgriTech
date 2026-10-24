const { body } = require('express-validator');
const Crop = require('../models/Crop');

const cropRules = [
  body('name').trim().notEmpty().withMessage('Crop name is required'),
  body('farm').notEmpty().withMessage('Farm ID is required'),
];

// Helper: generate soil health recommendations
const getSoilRecommendations = (soil) => {
  const recs = [];
  if (!soil) return recs;
  if (soil.pH < 5.5) recs.push('Soil is too acidic. Apply agricultural lime to raise pH.');
  else if (soil.pH > 8.0) recs.push('Soil is too alkaline. Add sulfur or organic matter to lower pH.');
  else recs.push('Soil pH is in a good range.');

  if (soil.nitrogen < 20) recs.push('Low nitrogen. Consider applying urea or compost.');
  else if (soil.nitrogen > 60) recs.push('High nitrogen. Reduce nitrogen-based fertilizers.');

  if (soil.phosphorus < 10) recs.push('Low phosphorus. Apply single super phosphate (SSP).');
  if (soil.potassium < 15) recs.push('Low potassium. Apply muriate of potash (MOP).');

  if (soil.moisture < 20) recs.push('Soil moisture is critically low. Irrigate immediately.');
  else if (soil.moisture > 80) recs.push('Soil is waterlogged. Improve drainage.');

  return recs;
};

// GET /api/crops
const getCrops = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.farm) filter.farm = req.query.farm;
    if (req.query.status) filter.status = req.query.status;

    const crops = await Crop.find(filter).populate('farm', 'name').sort('-createdAt').lean();
    res.json(crops);
  } catch (error) {
    next(error);
  }
};

// POST /api/crops
const createCrop = async (req, res, next) => {
  try {
    const crop = await Crop.create({ ...req.body, user: req.user._id });
    res.status(201).json(crop);
  } catch (error) {
    next(error);
  }
};

// GET /api/crops/:id
const getCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findOne({ _id: req.params.id, user: req.user._id })
      .populate('farm', 'name location');
    if (!crop) return res.status(404).json({ message: 'Crop not found' });

    const recommendations = getSoilRecommendations(crop.soilHealth);
    res.json({ ...crop.toObject(), recommendations });
  } catch (error) {
    next(error);
  }
};

// PUT /api/crops/:id
const updateCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    res.json(crop);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/crops/:id
const deleteCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    res.json({ message: 'Crop deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// PUT /api/crops/:id/soil – update soil health data
const updateSoilHealth = async (req, res, next) => {
  try {
    const { pH, nitrogen, phosphorus, potassium, moisture } = req.body;
    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { soilHealth: { pH, nitrogen, phosphorus, potassium, moisture, testedAt: new Date() } },
      { new: true }
    );
    if (!crop) return res.status(404).json({ message: 'Crop not found' });

    const recommendations = getSoilRecommendations(crop.soilHealth);
    res.json({ soilHealth: crop.soilHealth, recommendations });
  } catch (error) {
    next(error);
  }
};

// POST /api/crops/:id/growth-log
const addGrowthLog = async (req, res, next) => {
  try {
    const crop = await Crop.findOne({ _id: req.params.id, user: req.user._id });
    if (!crop) return res.status(404).json({ message: 'Crop not found' });

    crop.growthLogs.push(req.body);
    await crop.save();
    res.status(201).json(crop);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCrops, createCrop, getCrop, updateCrop, deleteCrop,
  updateSoilHealth, addGrowthLog, cropRules,
};
