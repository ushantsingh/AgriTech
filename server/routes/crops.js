const router = require('express').Router();
const {
  getCrops, createCrop, getCrop, updateCrop, deleteCrop,
  updateSoilHealth, addGrowthLog, cropRules,
} = require('../controllers/cropController');
const { validate } = require('../middleware/validate');
const { auth } = require('../middleware/auth');

router.use(auth);

router.route('/')
  .get(getCrops)
  .post(cropRules, validate, createCrop);

router.route('/:id')
  .get(getCrop)
  .put(updateCrop)
  .delete(deleteCrop);

router.put('/:id/soil', updateSoilHealth);
router.post('/:id/growth-log', addGrowthLog);

module.exports = router;
