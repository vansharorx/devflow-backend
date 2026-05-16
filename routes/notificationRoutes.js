const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authMiddleware');

const {
    getNotifications,
    markAsRead
} = require('../controllers/notificationController');

router.get('/', authenticate, getNotifications);

router.put('/:id/read', authenticate, markAsRead);

module.exports = router;