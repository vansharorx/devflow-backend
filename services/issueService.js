const {
  addIssue,
  getAllIssues,
  findIssueById,
  updateIssueStatus,
  assignIssue,
  getDetailedIssues,
  getPaginatedFilteredIssues
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

const getDetailedIssuesService = async () => {
  return await getDetailedIssues();
};

const getFilteredIssuesService = async (query) => {
  return await getPaginatedFilteredIssues(query);
};

module.exports = {
  createIssueService,
  getIssuesService,
  getDetailedIssuesService,
  getFilteredIssuesService,
  updateIssueStatus,
  assignIssue,
  findIssueById
};