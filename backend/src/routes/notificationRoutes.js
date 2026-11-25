const express = require('express');
const notificationController = require('../controllers/notificationController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { notificationIdParamSchema } = require('../validators/notificationValidator');

const router = express.Router();

router.use(auth);

router.get('/', notificationController.getNotifications);
router.patch('/:id/read', validate(notificationIdParamSchema), notificationController.markNotificationRead);

module.exports = router;

