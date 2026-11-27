const express = require('express');
const statusController = require('../controllers/statusController');
const statusRoutes = require('./statusRoutes');
const authRoutes = require('./authRoutes');
const szobaRoutes = require('./szobaRoutes');
const etelRoutes = require('./etelRoutes');

const router = express.Router();

// Gyökér végpont
router.get('/', statusController.getRoot);

// API útvonalak
router.use('/api/status', statusRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/szobak', szobaRoutes);
router.use('/api/etelek', etelRoutes);

module.exports = router;
