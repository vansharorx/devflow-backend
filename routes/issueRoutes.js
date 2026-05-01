const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authMiddleware'); 
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
  getFilteredIssues,
  searchIssues
} = issueController;

router.get('/search', authenticate, searchIssues);
router.get('/filter', authenticate, getFilteredIssues);

router.get('/', authenticate, getIssues);
router.get('/stats', authenticate, getIssueStats);
router.get('/detailed', authenticate, getDetailedIssues);
router.get('/:id/history', authenticate, getIssueHistory);

router.post(
  '/',
  authenticate,
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
  authenticate,
  authorizeRoles("ADMIN", "MANAGER"),
  updateIssueStatus
);

router.put(
  '/:id/assign',
  authenticate,
  authorizeRoles("ADMIN", "MANAGER"),
  assignIssue
);

module.exports = router;