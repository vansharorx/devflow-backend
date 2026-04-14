let projects = [];

const addProject = (project) => {
    projects.push(project);
};

const getAllProjects = () => {
    return projects;
};

const findProjectById = (id) => {
    return projects.find(p => p.id == id);
};


const getProjectStats = (issues) => {
    return projects.map(project => {
        const projectIssues = issues.filter(i => i.projectId == project.id);

        const total = projectIssues.length;

        const open = projectIssues.filter(i => i.status === "OPEN").length;
        const inProgress = projectIssues.filter(i => i.status === "IN_PROGRESS").length;
        const closed = projectIssues.filter(i => i.status === "CLOSED").length;

        // simple health score
        let health = 100;
        if (total > 0) {
            health = Math.round((closed / total) * 100);
        }

        return {
            projectId: project.id,
            projectName: project.name,
            totalIssues: total,
            OPEN: open,
            IN_PROGRESS: inProgress,
            CLOSED: closed,
            healthScore: health
        };
    });
};

module.exports = {
    addProject,
    getAllProjects,
    findProjectById,
    getProjectStats
};