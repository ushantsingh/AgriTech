const router = require('express').Router();
const {
  getStats, getUsers, updateUserRole,
  getPendingResources, approveResource,
  getAllOrders, updateOrderStatus, deleteForumPost,
} = require('../controllers/adminController');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth, adminOnly); // All admin routes require admin role

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/resources/pending', getPendingResources);
router.put('/resources/:id/approve', approveResource);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.delete('/forum/:id', deleteForumPost);

module.exports = router;
