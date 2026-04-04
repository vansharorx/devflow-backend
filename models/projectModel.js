let projects = [];

const addProject = (project) => {
    projects.push(project);
};

const getAllProjects = () => {
    return projects;
};

const findProjectById = (id) => {
    return projects.find(project => project.id == id);
};

module.exports = {
    addProject,
    getAllProjects,
    findProjectById
};