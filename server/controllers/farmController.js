const { body } = require('express-validator');
const Farm = require('../models/Farm');

const farmRules = [
  body('name').trim().notEmpty().withMessage('Farm name is required'),
  body('size').isFloat({ gt: 0 }).withMessage('Size must be a positive number'),
];

// GET /api/farms – list farms for current user
const getFarms = async (req, res, next) => {
  try {
    const farms = await Farm.find({ owner: req.user._id }).sort('-createdAt').lean();
    res.json(farms);
  } catch (error) {
    next(error);
  }
};

// POST /api/farms
const createFarm = async (req, res, next) => {
  try {
    const farm = await Farm.create({ ...req.body, owner: req.user._id });
    res.status(201).json(farm);
  } catch (error) {
    next(error);
  }
};

// GET /api/farms/:id
const getFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findOne({ _id: req.params.id, owner: req.user._id }).lean();
    if (!farm) return res.status(404).json({ message: 'Farm not found' });
    res.json(farm);
  } catch (error) {
    next(error);
  }
};

// PUT /api/farms/:id
const updateFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!farm) return res.status(404).json({ message: 'Farm not found' });
    res.json(farm);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/farms/:id
const deleteFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!farm) return res.status(404).json({ message: 'Farm not found' });
    res.json({ message: 'Farm deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getFarms, createFarm, getFarm, updateFarm, deleteFarm, farmRules };
