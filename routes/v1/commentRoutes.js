const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/authMiddleware');

const {
    createComment,
    getComments
} = require('../../controllers/commentController');

router.post('/', authenticate, createComment);

router.get('/:issueId', authenticate, getComments);

module.exports = router;