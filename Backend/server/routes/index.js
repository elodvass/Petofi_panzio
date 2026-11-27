const express = require('express');
const statusController = require('../controllers/statusController');
const statusRoutes = require('./statusRoutes');
const authRoutes = require('./authRoutes');
const felszerelesRoutes = require('./felszerelesRoutes');
const szobaRoutes = require('./szobaRoutes');
const etelRoutes = require('./etelRoutes');
const napiMenuRoutes = require('./napiMenuRoutes');
const foglalasRoutes = require('./foglalasRoutes');

const router = express.Router();

// Gyökér végpont
router.get('/', statusController.getRoot);

// API útvonalak
router.use('/api/status', statusRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/felszerelesek', felszerelesRoutes);
router.use('/api/szobak', szobaRoutes);
router.use('/api/etelek', etelRoutes);
router.use('/api/napi-menu', napiMenuRoutes);
router.use('/api/foglalasok', foglalasRoutes);

module.exports = router;
