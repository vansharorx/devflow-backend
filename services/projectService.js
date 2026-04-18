const {
    addProject,
    getAllProjects,
    findProjectById
} = require('../models/projectModel');

const { findUserById } = require('../models/userModel');

const createProjectService = (data) => {
    const { name, description, createdBy } = data;

    const user = findUserById(createdBy);
    if (!user) {
        throw new Error("User not found");
    }

    const newProject = {
        id: Date.now(),
        name,
        description,
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    addProject(newProject);
    return newProject;
};

const getProjectsService = () => getAllProjects();

module.exports = {
    createProjectService,
    getProjectsService,
    findProjectById
};