const {
    createProjectService,
    getProjectsService
} = require('../services/projectService');

const { getProjectStats } = require('../models/projectModel');
const { getAllIssues } = require('../models/issueModel');

exports.getProjects = (req, res, next) => {
    try {
        const projects = getProjectsService();

        res.json({
            success: true,
            message: "Projects fetched",
            data: projects
        });
    } catch (err) {
        next(err);
    }
};

exports.createProject = (req, res, next) => {
    try {
        const project = createProjectService(req.body);

        res.json({
            success: true,
            message: "Project created",
            data: project
        });
    } catch (err) {
        next(err);
    }
};

/* 🔥 Analytics */
exports.getProjectAnalytics = (req, res, next) => {
    try {
        const issues = getAllIssues();
        const stats = getProjectStats(issues);

        res.json({
            success: true,
            message: "Project analytics fetched",
            data: stats
        });
    } catch (err) {
        next(err);
    }
};