const { findIssueById } = require('../models/issueModel');
const { isProjectMember } = require('../models/projectMemberModel');

const authorizeIssueProjectMember = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // ADMIN has global project access.
        if (user.role === "ADMIN") {
            return next();
        }

        const { id } = req.params;

        const issue = await findIssueById(id);

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found"
            });
        }

        const member = await isProjectMember(
            issue.project_id,
            user.id
        );

        if (!member) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this project"
            });
        }

        // Keep the issue available to downstream controllers.
        req.issue = issue;

        next();

    } catch (err) {
        console.error(
            "Project membership authorization failed:",
            err.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to verify project membership"
        });
    }
};

module.exports = {
    authorizeIssueProjectMember
};