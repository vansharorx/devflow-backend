const {
    addIssue,
    getAllIssues,
    updateIssueStatus,
    assignIssue,
    getIssuesByProject,
    getIssuesByStatus,
    searchIssues,
    getPaginatedIssues,
    findIssueById
} = require('../models/issueModel');

const { findProjectById } = require('../models/projectModel');
const { findUserById } = require('../models/userModel');

const createIssueService = (data) => {
    const { title, description, projectId, createdBy, status } = data;

    const project = findProjectById(projectId);
    if (!project) throw new Error("Project not found");

    const user = findUserById(createdBy);
    if (!user) throw new Error("User not found");

    const newIssue = {
        id: Date.now(),
        title,
        description,
        projectId,
        createdBy,
        assignedTo: null,
        status: status || "OPEN",
        history: [],
        createdAt: new Date(),
        updatedAt: new Date()
    };

    addIssue(newIssue);
    return newIssue;
};

module.exports = {
    createIssueService,
    getAllIssues,
    updateIssueStatus,
    assignIssue,
    getIssuesByProject,
    getIssuesByStatus,
    searchIssues,
    getPaginatedIssues,
    findIssueById
};