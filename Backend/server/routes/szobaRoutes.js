const express = require('express');
const szobaController = require('../controllers/szobaController');

const router = express.Router();

router.get('/', szobaController.getAll);

module.exports = router;
