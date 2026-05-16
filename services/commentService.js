const {
    addComment,
    getCommentsByIssue
} = require('../models/commentModel');

const createCommentService = async ({
    issueId,
    userId,
    comment
}) => {
    const newComment = {
        id: Date.now(),
        issueId,
        userId,
        comment
    };

    await addComment(newComment);

    return newComment;
};

const getIssueCommentsService = async (issueId) => {
    return await getCommentsByIssue(issueId);
};

module.exports = {
    createCommentService,
    getIssueCommentsService
};