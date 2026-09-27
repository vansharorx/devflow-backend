const {
    addProject,
    getAllProjects,
    findProjectById,
    softDeleteProject,
    restoreProject,
} = require("../models/projectModel");

const { findUserById } = require("../models/userModel");
const { addProjectMember } = require("../models/projectMemberModel");
const AppError = require("../utils/AppError");

const createProjectService = async (data) => {
    const { name, description, createdBy } = data;
    const user = await findUserById(createdBy);
    if (!user) {
        throw new AppError("User not found", 400);
    }
    const newProject = {
        name,
        description,
        createdBy,
    };
    const result = await addProject(newProject);
    const projectId = result.insertId;
    await addProjectMember(projectId, createdBy);
    return {
        id: projectId,
        name,
        description,
        createdBy,
    };
};

const getProjectsService = async () => {
    return await getAllProjects();
};

const deleteProjectService = async (id) => {
    return await softDeleteProject(id);
};

const restoreProjectService = async (id) => {
    return await restoreProject(id);
};

module.exports = {
    createProjectService,
    getProjectsService,
    findProjectById,
    deleteProjectService,
    restoreProjectService,
};