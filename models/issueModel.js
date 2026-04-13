let issues = [];

const addIssue = (issue) => {
    issues.push(issue);
};

const getAllIssues = () => issues;

const findIssueById = (id) => {
    return issues.find(i => i.id == id);
};

const updateIssueStatus = (id, status) => {
    const issue = findIssueById(id);
    if (!issue) return null;

    issue.history.push({
        action: "STATUS_UPDATED",
        newStatus: status,
        timestamp: new Date()
    });

    issue.status = status;
    issue.updatedAt = new Date();

    return issue;
};

const assignIssue = (id, userId) => {
    const issue = findIssueById(id);
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

const getIssuesByProject = (projectId) => {
    return issues.filter(i => i.projectId == projectId);
};

const getIssuesByStatus = (status) => {
    return issues.filter(i => i.status === status);
};

const searchIssues = (query) => {
    return issues.filter(i =>
        i.title.toLowerCase().includes(query.toLowerCase())
    );
};

const getPaginatedIssues = (page = 1, limit = 5) => {
    const start = (page - 1) * limit;
    return issues.slice(start, start + limit);
};

/* 🔥 NEW: Analytics */
const getIssueStats = () => {
    const stats = {
        total: issues.length,
        OPEN: 0,
        IN_PROGRESS: 0,
        CLOSED: 0
    };

    issues.forEach(issue => {
        stats[issue.status]++;
    });

    return stats;
};

module.exports = {
    addIssue,
    getAllIssues,
    updateIssueStatus,
    assignIssue,
    getIssuesByProject,
    getIssuesByStatus,
    searchIssues,
    getPaginatedIssues,
    getIssueStats,
    findIssueById
};