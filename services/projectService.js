const {
    addProject,
    getAllProjects,
    findProjectById,
    softDeleteProject
} = require('../models/projectModel');

const { findUserById } = require('../models/userModel');

const createProjectService = async (data) => {
    const { name, description, createdBy } = data;

    const user = await findUserById(createdBy);
    if (!user) {
        throw new Error("User not found");
    }

    const newProject = {
        id: Date.now(),
        name,
        description,
        createdBy
    };

    await addProject(newProject);
    return newProject;
};

const getProjectsService = async () => {
    return await getAllProjects();
};

const deleteProjectService = async (id) => {
    return await softDeleteProject(id);
};


module.exports = {
    createProjectService,
    getProjectsService,
    findProjectById,
    deleteProjectService
};