const express = require('express');
const router = express.Router();

const {
    getIssues,
    createIssue,
    assignIssue,
    updateIssueStatus
} = require('../controllers/issueController');

router.get('/', getIssues);
router.post('/', createIssue);
router.put('/:id/status', updateIssueStatus);
router.put('/:id/assign', assignIssue);
module.exports = router;