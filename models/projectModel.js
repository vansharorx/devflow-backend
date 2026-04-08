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

const updateProject = (id, updates) => {
    const project = projects.find(p => p.id == id);

    if (!project) return null;

    Object.assign(project, updates);
    project.updatedAt = new Date();

    return project;
};

module.exports = {
    addProject,
    getAllProjects,
    findProjectById,
    updateProject
};