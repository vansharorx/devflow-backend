const express = require('express');
const router = express.Router();

const authorizeRoles = require('../../middleware/roleMiddleware');
const { body } = require('express-validator');
const validate = require('../middleware/validationMiddleware');

const {
    getProjects,
    createProject,
    getProjectAnalytics
} = require('../controllers/projectController');

router.get('/', getProjects);

router.get('/analytics', getProjectAnalytics);

router.post(
    '/',
    authorizeRoles("ADMIN", "MANAGER"),
    [
        body('name').notEmpty().withMessage('Project name required'),
        body('createdBy').notEmpty().withMessage('Creator required')
    ],
    validate,
    createProject
);

module.exports = router;