const router = require('express').Router();
const { getFarms, createFarm, getFarm, updateFarm, deleteFarm, farmRules } = require('../controllers/farmController');
const { validate } = require('../middleware/validate');
const { auth } = require('../middleware/auth');

router.use(auth); // All farm routes require authentication

router.route('/')
  .get(getFarms)
  .post(farmRules, validate, createFarm);

router.route('/:id')
  .get(getFarm)
  .put(updateFarm)
  .delete(deleteFarm);

module.exports = router;
