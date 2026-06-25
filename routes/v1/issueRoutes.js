const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/authMiddleware'); 
const authorizeRoles = require('../../middleware/roleMiddleware');
const upload = require('../../middleware/uploadMiddleware');

const { body } = require('express-validator');
const validate = require('../../middleware/validationMiddleware');

const issueController = require('../../controllers/issueController');

const {
  getIssues,
  createIssue,
  assignIssue,
  updateIssueStatus,
  getIssueHistory,
  getIssueStats,
  getDetailedIssues,
  getFilteredIssues,
  searchIssues,
  deleteIssue
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
  upload.single('attachment'),
  [
    body('title').notEmpty().withMessage('Title required'),
    body('projectId').notEmpty().withMessage('Project ID required')
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

router.delete(
  '/:id',
  authenticate,
  authorizeRoles("ADMIN", "MANAGER"),
  deleteIssue
);

module.exports = router;