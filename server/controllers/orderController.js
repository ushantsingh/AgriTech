const Order = require('../models/Order');
const Resource = require('../models/Resource');

// POST /api/orders – place an order
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Validate resources and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const resource = await Resource.findById(item.resource);
      if (!resource) {
        return res.status(400).json({ message: `Resource ${item.resource} not found` });
      }
      if (resource.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${resource.name}` });
      }

      orderItems.push({
        resource: resource._id,
        name: resource.name,
        quantity: item.quantity,
        price: resource.price,
      });
      totalAmount += resource.price * item.quantity;

      // Decrement stock
      resource.stock -= item.quantity;
      await resource.save();
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders – list user's orders
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.resource', 'name category')
      .sort('-createdAt')
      .lean();
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate('items.resource', 'name category');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getOrders, getOrder };
