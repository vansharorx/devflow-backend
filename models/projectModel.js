let projects = [];

const addProject = (project) => {
    projects.push(project);
};

const getAllProjects = () => {
    return projects;
};

module.exports = {
    addProject,
    getAllProjects
};