const {
    createCommentService,
    getIssueCommentsService
} = require('../services/commentService');

exports.createComment = async (req, res) => {
    try {
        const { issueId, comment } = req.body;
        console.log("BODY:", req.body);
        const newComment = await createCommentService({
            issueId,
            userId: req.user.id,
            comment
        });

        res.json({
            success: true,
            message: "Comment added",
            data: newComment
        });

    } 
    
    catch (err) {
        console.error(
            "Failed to create comment:",
            err
        );

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.getComments = async (req, res) => {
    try {
        const { issueId } = req.params;

        const comments =
            await getIssueCommentsService(issueId);

        res.json({
            success: true,
            data: comments
        });

    } 
    
    catch (err) {
        console.error(
            "Failed to fetch comments:",
            err
        );

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};