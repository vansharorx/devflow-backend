const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/authMiddleware');

const {
    getActivities
} = require('../../controllers/activityController');

router.get('/', authenticate, getActivities);

module.exports = router;