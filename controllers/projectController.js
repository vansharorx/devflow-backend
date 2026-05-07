const {
    createProjectService,
    getProjectsService
} = require('../services/projectService');

const cache = require('../config/cache');

exports.getProjects = async (req, res) => {
    try {
        const cachedProjects = cache.get('projects');

        if (cachedProjects) {
            return res.json({
                success: true,
                source: "cache",
                data: cachedProjects
            });
        }

        // DB fetch
        const projects = await getProjectsService();

        // Save to cache
        cache.set('projects', projects);

        res.json({
            success: true,
            source: "database",
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

        cache.del('projects');

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