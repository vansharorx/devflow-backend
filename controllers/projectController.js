const asyncHandler = require("../middleware/asyncHandler");

const {
    createProjectService,
    getProjectsService,
    deleteProjectService,
    restoreProjectService,
} = require("../services/projectService");

const cache = require("../config/cache");

exports.getProjects = asyncHandler(async (req, res) => {
    const cachedProjects = cache.get("projects");

    if (cachedProjects) {
        return res.json({
            success: true,
            source: "cache",
            data: cachedProjects,
        });
    }

    const projects = await getProjectsService();

    cache.set("projects", projects);

    res.json({
        success: true,
        source: "database",
        data: projects,
    });
});

exports.createProject = asyncHandler(async (req, res) => {
    const project = await createProjectService({
        ...req.body,
        createdBy: req.user.id,
    });

    cache.del("projects");

    res.json({
        success: true,
        message: "Project created",
        data: project,
    });
});

exports.getProjectAnalytics = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        message: "Analytics endpoint working",
    });
});

exports.deleteProject = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await deleteProjectService(id);

    cache.del("projects");

    res.json({
        success: true,
        message: "Project deleted successfully",
    });
});

exports.restoreProject = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await restoreProjectService(id);

    cache.del("projects");

    res.json({
        success: true,
        message: "Project restored successfully",
    });
});