const express = require('express');
const router = express.Router();

const {
    getIssues,
    createIssue,
    updateIssueStatus
} = require('../controllers/issueController');

router.get('/', getIssues);
router.post('/', createIssue);
router.put('/:id/status', updateIssueStatus);

module.exports = router;