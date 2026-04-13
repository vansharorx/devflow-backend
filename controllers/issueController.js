const {
    addIssue,
    getAllIssues,
    updateIssueStatus,
    getIssuesByProject,
    getIssuesByStatus,
    searchIssues,
    assignIssue,
    getPaginatedIssues
} = require('../models/issueModel');

const { findProjectById } = require('../models/projectModel');
const { findUserById } = require('../models/userModel');
const { getIssueStats } = require('../models/issueModel');

exports.getIssueStats = (req, res) => {
    const stats = getIssueStats();

    res.json({
        message: "Issue stats fetched",
        data: stats
    });
};

exports.getIssues = (req, res) => {
    const { page = 1, limit = 5, projectId, status, search } = req.query;

    if (search) {
        return res.json({
            data: searchIssues(search)
        });
    }

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

    const paginated = getPaginatedIssues(Number(page), Number(limit));

    res.json({
        page: Number(page),
        limit: Number(limit),
        data: paginated
    });
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
            assignedTo: null,
            history: [],
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


exports.assignIssue = (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({
            message: "User ID is required"
        });
    }

    const user = findUserById(userId);
    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    const updated = assignIssue(id, userId);

    if (!updated) {
        return res.status(404).json({
            message: "Issue not found"
        });
    }

    res.json({
        message: "Issue assigned successfully",
        data: updated
    });
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


exports.getIssueHistory = (req, res) => {
    const { id } = req.params;

    const issues = getAllIssues();
    const issue = issues.find(i => String(i.id) === String(id));

    if (!issue) {
        return res.status(404).json({
            message: "Issue not found"
        });
    }

    res.json({
        data: issue.history || []
    });
};