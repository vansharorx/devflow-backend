const asyncHandler = require("../middleware/asyncHandler");

const {
    createCommentService,
    getIssueCommentsService,
} = require("../services/commentService");

exports.createComment = asyncHandler(async (req, res) => {
    const { issueId, comment } = req.body;

    const newComment = await createCommentService({
        issueId,
        userId: req.user.id,
        comment,
    });

    res.json({
        success: true,
        message: "Comment added",
        data: newComment,
    });
});

exports.getComments = asyncHandler(async (req, res) => {
    const { issueId } = req.params;

    const comments = await getIssueCommentsService(issueId);

    res.json({
        success: true,
        data: comments,
    });
});