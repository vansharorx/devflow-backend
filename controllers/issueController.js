const {
  createIssueService,
  getIssuesService,
  updateIssueStatus: updateIssueStatusService,
  assignIssue: assignIssueService,
  findIssueById,
  getDetailedIssuesService,
  getFilteredIssuesService
} = require('../services/issueService');

const { sendAssignmentEmail } = require('../utils/mailer');
const { findUserById } = require('../models/userModel');
const { createActivityService } = require('../services/activityService');

const {
    createNotificationService
} = require('../services/notificationService');

exports.getIssues = async (req, res) => {
  try {
    const issues = await getIssuesService();

    res.json({
      success: true,
      data: issues
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.createIssue = async (req, res) => {
    try {
        const issue = await createIssueService({
            ...req.body,
            attachment: req.file ? req.file.filename : null
        });

        // Activity log
        await createActivityService({
            action: 'Issue Created',
            entityType: 'ISSUE',
            entityId: issue.id,
            performedBy: req.user.id
        });

        res.json({
            success: true,
            message: "Issue created",
            data: issue
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

exports.updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await updateIssueStatusService(id, status);

    res.json({
      success: true,
      message: "Status updated"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.assignIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        await assignIssueService(id, userId);

        const user = await findUserById(userId);
        const issue = await findIssueById(id);

        await sendAssignmentEmail(user.email, issue.title);

        await createNotificationService({
            userId,
            message: `You were assigned issue: ${issue.title}`
        });

        res.json({
            success: true,
            message: "Issue assigned and email sent"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getIssueHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await findIssueById(id);

    res.json({
      success: true,
      message: "Issue history fetched",
      data: issue || []
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.getIssueStats = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Issue stats fetched",
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.getDetailedIssues = async (req, res) => {
  try {
    const data = await getDetailedIssuesService();

    res.json({
      success: true,
      data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.getFilteredIssues = async (req, res) => {
  try {
    const { page = 1, limit = 5, status, projectId } = req.query;

    const data = await getFilteredIssuesService({
      page,
      limit,
      status,
      projectId
    });

    res.json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.searchIssues = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    const issues = await getIssuesService();

    const filtered = issues.filter(issue =>
      issue.title?.toLowerCase().includes(query.toLowerCase())
    );

    res.json({
      success: true,
      results: filtered
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};