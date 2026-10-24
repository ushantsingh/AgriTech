const router = require('express').Router();
const { getResources, getResource, createResource, updateResource, deleteResource } = require('../controllers/resourceController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', getResources);           // Public – list approved resources
router.get('/:id', getResource);         // Public – resource detail

router.post('/', auth, createResource);  // Auth – farmer can suggest
router.put('/:id', auth, adminOnly, updateResource);    // Admin only
router.delete('/:id', auth, adminOnly, deleteResource); // Admin only

module.exports = router;
