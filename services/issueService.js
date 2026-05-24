const db = require('../config/db');

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
    status: "OPEN",
    attachment: data.attachment || null
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

const transactionalAssignIssue = async ({
  issueId,
  userId,
  issueTitle
}) => {

  const connection = await db.promise().getConnection();

  try {

    await connection.beginTransaction();

    await connection.query(
      `
      UPDATE issues
      SET assigned_to = ?
      WHERE id = ?
      `,
      [userId, issueId]
    );

    await connection.query(
      `
      INSERT INTO notifications
      (id, user_id, message)
      VALUES (?, ?, ?)
      `,
      [
        Date.now(),
        userId,
        `You were assigned issue: ${issueTitle}`
      ]
    );

    await connection.query(
      `
      INSERT INTO activities
      (id, action, entity_type, entity_id, performed_by)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        Date.now() + 1,
        'Issue Assigned',
        'ISSUE',
        issueId,
        userId
      ]
    );

    await connection.commit();

    return true;

  } catch (err) {

    await connection.rollback();

    throw err;

  } finally {

    connection.release();
  }
};

module.exports = {
  createIssueService,
  getIssuesService,
  getDetailedIssuesService,
  getFilteredIssuesService,
  updateIssueStatus,
  assignIssue,
  transactionalAssignIssue,
  findIssueById
};