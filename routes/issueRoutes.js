const express = require('express');
const router = express.Router();

const {
    getIssues,
    createIssue
} = require('../controllers/issueController');

router.get('/', getIssues);
router.post('/', createIssue);

module.exports = router;