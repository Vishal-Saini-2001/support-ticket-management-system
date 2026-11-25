const express = require('express');
const statsController = require('../controllers/statsController');
const auth = require('../middlewares/auth');

const router = express.Router();

router.get('/', auth, statsController.getStats);

module.exports = router;

