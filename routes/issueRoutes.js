const express = require('express');
const router = express.Router();

const authorizeRoles = require('../middleware/roleMiddleware');
const { body } = require('express-validator');
const validate = require('../middleware/validationMiddleware');

const issueController = require('../controllers/issueController');

const {
  getIssues,
  createIssue,
  assignIssue,
  updateIssueStatus,
  getIssueHistory,
  getIssueStats,
  getDetailedIssues,
  getFilteredIssues
} = issueController;

router.get('/filter', getFilteredIssues);

router.get('/', getIssues);
router.get('/stats', getIssueStats);
router.get('/detailed', getDetailedIssues);
router.get('/:id/history', getIssueHistory);

router.post(
  '/',
  authorizeRoles("ADMIN", "MANAGER"),
  [
    body('title').notEmpty().withMessage('Title required'),
    body('projectId').notEmpty().withMessage('Project ID required'),
    body('createdBy').notEmpty().withMessage('User ID required')
  ],
  validate,
  createIssue
);

router.put(
  '/:id/status',
  authorizeRoles("ADMIN", "MANAGER"),
  updateIssueStatus
);

router.put(
  '/:id/assign',
  authorizeRoles("ADMIN", "MANAGER"),
  assignIssue
);

module.exports = router;