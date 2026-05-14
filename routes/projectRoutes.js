/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of projects
 */
const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const { body } = require('express-validator');
const validate = require('../middleware/validationMiddleware');

const {
    getProjects,
    createProject,
    getProjectAnalytics,
    deleteProject,
    restoreProject
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

router.delete(
    '/:id',
    authenticate,
    authorizeRoles("ADMIN"),
    deleteProject
);
router.put(
    '/:id/restore',
    authenticate,
    authorizeRoles("ADMIN"),
    restoreProject
);
module.exports = router;