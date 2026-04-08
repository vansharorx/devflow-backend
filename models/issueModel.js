let issues = [];

const addIssue = (issue) => {
    issues.push(issue);
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

module.exports = {
    addIssue,
    getAllIssues,
    updateIssueStatus,
    getIssuesByProject,
    getIssuesByStatus
};