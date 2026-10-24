const router = require('express').Router();
const { createOrder, getOrders, getOrder } = require('../controllers/orderController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.route('/')
  .get(getOrders)
  .post(createOrder);

router.get('/:id', getOrder);

module.exports = router;
