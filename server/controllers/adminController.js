const User = require('../models/User');
const Resource = require('../models/Resource');
const Order = require('../models/Order');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const ForumPost = require('../models/ForumPost');

// GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    const [users, farms, crops, resources, orders, posts] = await Promise.all([
      User.countDocuments(),
      Farm.countDocuments(),
      Crop.countDocuments(),
      Resource.countDocuments(),
      Order.countDocuments(),
      ForumPost.countDocuments(),
    ]);

    const pendingResources = await Resource.countDocuments({ approved: false });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const revenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    res.json({
      users, farms, crops, resources, orders, posts,
      pendingResources, pendingOrders,
      revenue: revenue[0]?.total || 0,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt').lean();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/users/:id/role
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['farmer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/resources/pending
const getPendingResources = async (req, res, next) => {
  try {
    const resources = await Resource.find({ approved: false })
      .populate('createdBy', 'name email')
      .sort('-createdAt')
      .lean();
    res.json(resources);
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/resources/:id/approve
const approveResource = async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json(resource);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/orders
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort('-createdAt')
      .lean();
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/forum/:id
const deleteForumPost = async (req, res, next) => {
  try {
    const post = await ForumPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted by admin' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats, getUsers, updateUserRole,
  getPendingResources, approveResource,
  getAllOrders, updateOrderStatus, deleteForumPost,
};
