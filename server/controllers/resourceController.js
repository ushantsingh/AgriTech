const Resource = require('../models/Resource');

// GET /api/resources – list approved resources (public)
const getResources = async (req, res, next) => {
  try {
    const filter = { approved: true };
    if (req.query.category) filter.category = req.query.category;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [resources, total] = await Promise.all([
      Resource.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
      Resource.countDocuments(filter),
    ]);

    res.json({ resources, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// GET /api/resources/:id
const getResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id).lean();
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json(resource);
  } catch (error) {
    next(error);
  }
};

// POST /api/resources – farmer can suggest a resource (needs admin approval)
const createResource = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const resource = await Resource.create({
      ...req.body,
      createdBy: req.user._id,
      approved: isAdmin, // auto-approve if admin creates it
    });
    res.status(201).json(resource);
  } catch (error) {
    next(error);
  }
};

// PUT /api/resources/:id
const updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json(resource);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/resources/:id
const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getResources, getResource, createResource, updateResource, deleteResource };
