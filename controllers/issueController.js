const {
    addIssue,
    getAllIssues,
    updateIssueStatus,
    getIssuesByProject,
    getIssuesByStatus
} = require('../models/issueModel');

const { findProjectById } = require('../models/projectModel');
const { findUserById } = require('../models/userModel');

exports.getIssues = (req, res, next) => {
    try {
        const { projectId, status } = req.query;

        if (projectId) {
            return res.json({
                data: getIssuesByProject(projectId)
            });
        }

        if (status) {
            return res.json({
                data: getIssuesByStatus(status)
            });
        }

        res.json({
            data: getAllIssues()
        });
    } catch (error) {
        next(error);
    }
};

exports.createIssue = (req, res, next) => {
    try {
        const { title, description, projectId, createdBy, status } = req.body;

        if (!title || !projectId || !createdBy) {
            return res.status(400).json({
                message: "Title, projectId and createdBy are required"
            });
        }

        const project = findProjectById(projectId);
        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const user = findUserById(createdBy);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const newIssue = {
            id: Date.now(),
            title,
            description,
            projectId,
            createdBy,
            status: status || "OPEN",
            createdAt: new Date(),
            updatedAt: new Date()
        };

        addIssue(newIssue);

        res.json({
            message: "Issue created successfully",
            data: newIssue
        });
    } catch (error) {
        next(error);
    }
};

exports.updateIssueStatus = (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                message: "Status is required"
            });
        }

        const updated = updateIssueStatus(id, {
            status,
            updatedAt: new Date()
        });

        if (!updated) {
            return res.status(404).json({
                message: "Issue not found"
            });
        }

        res.json({
            message: "Issue status updated",
            data: updated
        });
    } catch (error) {
        next(error);
    }
};