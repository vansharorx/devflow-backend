const express = require('express');
const router = express.Router();

const {
    getProjects,
    createProject,
    getProjectAnalytics
} = require('../controllers/projectController');

router.get('/', getProjects);
router.post('/', createProject);
router.get('/analytics', getProjectAnalytics);
module.exports = router;