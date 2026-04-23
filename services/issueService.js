const {
    addIssue,
    getAllIssues,
    findIssueById,
    updateIssueStatus,
    assignIssue
} = require('../models/issueModel');

const { findProjectById } = require('../models/projectModel');
const { findUserById } = require('../models/userModel');

const createIssueService = async (data) => {
    const { title, description, projectId, createdBy } = data;

    const project = await findProjectById(projectId);
    if (!project) throw new Error("Project not found");

    const user = await findUserById(createdBy);
    if (!user) throw new Error("User not found");

    const newIssue = {
        id: Date.now(),
        title,
        description,
        projectId,
        createdBy,
        assignedTo: null,
        status: "OPEN"
    };

    await addIssue(newIssue);
    return newIssue;
};

const getIssuesService = async () => {
    return await getAllIssues();
};

module.exports = {
    createIssueService,
    getIssuesService,
    updateIssueStatus,
    assignIssue,
    findIssueById
};