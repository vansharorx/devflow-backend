let issues = [];

const addIssue = (issue) => {
    issues.push(issue);
};

const searchIssues = (query) => {
    return issues.filter(issue =>
        issue.title.toLowerCase().includes(query.toLowerCase())
    );
};

const assignIssue = (id, userId) => {
    const issue = issues.find(i => i.id == id);

    if (!issue) return null;

    issue.assignedTo = userId;
    issue.updatedAt = new Date();

    return issue;
};

const getAllIssues = () => {
    return issues;
};

const updateIssueStatus = (id, updates) => {
    const issue = issues.find(i => i.id == id);

    if (!issue) return null;

    issue.status = updates.status;
    issue.updatedAt = new Date();

    return issue;
};

const getIssuesByProject = (projectId) => {
    return issues.filter(i => i.projectId == projectId);
};

const getIssuesByStatus = (status) => {
    return issues.filter(i => i.status === status);
};

const getPaginatedIssues = (page = 1, limit = 5) => {
    const start = (page - 1) * limit;
    const end = start + limit;

    return issues.slice(start, end);
};

module.exports = {
    addIssue,
    searchIssues,
    assignIssue,
    getAllIssues,
    updateIssueStatus,
    getIssuesByProject,
    getIssuesByStatus,
    getPaginatedIssues 
};