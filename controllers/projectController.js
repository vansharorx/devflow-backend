const {
    createProjectService,
    getProjectsService
} = require('../services/projectService');

exports.getProjects = async (req, res) => {
    try {
        const projects = await getProjectsService();

        res.json({
            success: true,
            data: projects
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.createProject = async (req, res) => {
    try {
        const project = await createProjectService(req.body);

        res.json({
            success: true,
            message: "Project created",
            data: project
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

exports.getProjectAnalytics = async (req, res) => {
    try {
        res.json({
            success: true,
            message: "Analytics endpoint working"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};