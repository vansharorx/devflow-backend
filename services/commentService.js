const { addComment, getCommentsByIssue } = require("../models/commentModel");

const createCommentService = async ({ issueId, userId, comment }) => {
    const newComment = {
        issueId,
        userId,
        comment,
    };

    const result = await addComment(newComment);

    return {
        id: result.insertId,
        ...newComment,
    };
};

const getIssueCommentsService = async (issueId) => {
    return await getCommentsByIssue(issueId);
};

module.exports = {
    createCommentService,
    getIssueCommentsService,
};