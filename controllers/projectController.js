const {
    createProjectService,
    getProjectsService,
    deleteProjectService,
    restoreProjectService
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

        const projects = await getProjectsService();

        cache.set('projects', projects);

        res.json({
            success: true,
            source: "database",
            data: projects
        });

    } catch (err) {
        console.error(
            "Failed to fetch projects:",
            err
        );

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.createProject = async (req, res) => {
    try {
        const project = await createProjectService({
            ...req.body,
            createdBy: req.user.id
        });

        cache.del('projects');

        res.json({
            success: true,
            message: "Project created",
            data: project
        });

    } catch (err) {
        console.error(
            "Failed to create project:",
            err
        );

        if (err.message === "User not found") {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error"
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
        console.error(
            "Failed to fetch project analytics:",
            err
        );

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        await deleteProjectService(id);

        cache.del('projects');

        res.json({
            success: true,
            message: "Project deleted successfully"
        });

    } catch (err) {
        console.error(
            "Failed to delete project:",
            err
        );

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.restoreProject = async (req, res) => {
    try {
        const { id } = req.params;

        await restoreProjectService(id);

        cache.del('projects');

        res.json({
            success: true,
            message: "Project restored successfully"
        });

    } catch (err) {
        console.error(
            "Failed to restore project:",
            err
        );

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};