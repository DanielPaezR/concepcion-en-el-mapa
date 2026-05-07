const express = require('express');
const router = express.Router();
const pushNotificationController = require('../controllers/pushNotificationController');
const authMiddleware = require('../middleware/auth');

router.get('/public-key', pushNotificationController.getPublicKey);
router.use(authMiddleware);
router.post('/subscribe', pushNotificationController.subscribe);
router.post('/unsubscribe', pushNotificationController.unsubscribe);
router.get('/my-subscriptions', pushNotificationController.getMySuscriptions);
router.get('/history', pushNotificationController.getNotificationHistory);
router.post('/test', pushNotificationController.sendTest);

module.exports = router;
