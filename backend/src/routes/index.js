const express = require('express');
const authRoutes = require('./authRoutes');
const ticketRoutes = require('./ticketRoutes');
const statsRoutes = require('./statsRoutes');
const notificationRoutes = require('./notificationRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);
router.use('/stats', statsRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;

