const express = require('express');
const router = express.Router();
const authorizeRoles = require('../../middleware/roleMiddleware');

const {
    getProjects,
    createProject,
    getProjectAnalytics
} = require('../controllers/projectController');

router.get('/', getProjects);
router.post('/', createProject);
router.get('/analytics', getProjectAnalytics);
router.post('/', authorizeRoles("ADMIN", "MANAGER"), createProject);
module.exports = router;