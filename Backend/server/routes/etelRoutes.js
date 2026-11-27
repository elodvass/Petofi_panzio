const express = require('express');
const etelController = require('../controllers/etelController');

const router = express.Router();

router.get('/', etelController.getAll);
router.get('/napi-menu', etelController.getDailyMenu);

module.exports = router;
