const express = require('express');
const felszerelesController = require('../controllers/felszerelesController');

const router = express.Router();

router.get('/', felszerelesController.getAll);

module.exports = router;
