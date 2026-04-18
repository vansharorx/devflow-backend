const {
    createIssueService,
    getAllIssues,
    updateIssueStatus,
    assignIssue,
    getIssuesByProject,
    getIssuesByStatus,
    searchIssues,
    getPaginatedIssues,
    findIssueById
} = require('../services/issueService');

const { findUserById } = require('../models/userModel');
const { getIssueStats } = require('../models/issueModel');

exports.getIssues = (req, res, next) => {
    try {
        const { page = 1, limit = 5, projectId, status, search } = req.query;

        if (search) {
            return res.json({
                success: true,
                data: searchIssues(search)
            });
        }

        if (projectId) {
            return res.json({
                success: true,
                data: getIssuesByProject(projectId)
            });
        }

        if (status) {
            return res.json({
                success: true,
                data: getIssuesByStatus(status)
            });
        }

        const paginated = getPaginatedIssues(Number(page), Number(limit));

        res.json({
            success: true,
            page: Number(page),
            limit: Number(limit),
            data: paginated
        });
    } catch (err) {
        next(err);
    }
};

exports.createIssue = (req, res, next) => {
    try {
        const issue = createIssueService(req.body);

        res.json({
            success: true,
            message: "Issue created",
            data: issue
        });
    } catch (err) {
        next(err);
    }
};

exports.updateIssueStatus = (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = updateIssueStatus(id, status);

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Issue not found"
            });
        }

        res.json({
            success: true,
            message: "Status updated",
            data: updated
        });
    } catch (err) {
        next(err);
    }
};

exports.assignIssue = (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        const user = findUserById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const updated = assignIssue(id, userId);

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Issue not found"
            });
        }

        res.json({
            success: true,
            message: "Issue assigned",
            data: updated
        });
    } catch (err) {
        next(err);
    }
};

exports.getIssueHistory = (req, res, next) => {
    try {
        const { id } = req.params;

        const issue = findIssueById(id);

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found"
            });
        }

        res.json({
            success: true,
            data: issue.history
        });
    } catch (err) {
        next(err);
    }
};

exports.getIssueStats = (req, res, next) => {
    try {
        const stats = getIssueStats();

        res.json({
            success: true,
            message: "Issue stats fetched",
            data: stats
        });
    } catch (err) {
        next(err);
    }
};