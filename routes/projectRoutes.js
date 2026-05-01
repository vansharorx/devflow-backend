const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authMiddleware'); // ✅ added
const authorizeRoles = require('../middleware/roleMiddleware');

const { body } = require('express-validator');
const validate = require('../middleware/validationMiddleware');

const {
    getProjects,
    createProject,
    getProjectAnalytics
} = require('../controllers/projectController');

router.get('/', authenticate, getProjects);

router.get('/analytics', authenticate, getProjectAnalytics);

router.post(
    '/',
    authenticate,
    authorizeRoles("ADMIN", "MANAGER"),
    [
        body('name').notEmpty().withMessage('Project name required'),
        body('createdBy').notEmpty().withMessage('Creator required')
    ],
    validate,
    createProject
);

module.exports = router;