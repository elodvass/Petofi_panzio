const express = require('express');
const etelController = require('../controllers/etelController');

const router = express.Router();

router.get('/', etelController.getAll);

module.exports = router;
