let issues = [];

const addIssue = (issue) => {
    const newIssue = {
        ...issue,
        id: Date.now(),
        status: issue.status || "OPEN",
        assignedTo: null,
        history: [],
        createdAt: new Date(),
        updatedAt: new Date()
    };

    issues.push(newIssue);
    return newIssue;
};

const searchIssues = (query) => {
    return issues.filter(issue =>
        issue.title.toLowerCase().includes(query.toLowerCase())
    );
};

const assignIssue = (id, userId) => {
    const issue = issues.find(i => i.id == id);
    if (!issue) return null;

    issue.history.push({
        action: "ASSIGNED",
        assignedTo: userId,
        timestamp: new Date()
    });

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

    const status = updates.status;

    issue.history.push({
        action: "STATUS_UPDATED",
        newStatus: status,
        timestamp: new Date()
    });

    issue.status = status;
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