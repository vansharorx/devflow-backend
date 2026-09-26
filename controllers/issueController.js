const {
    createIssueService,
    getIssuesService,
    searchIssuesService,
    updateIssueStatus: updateIssueStatusService,
    findIssueById,
    getDetailedIssuesService,
    getFilteredIssuesService,
    transactionalAssignIssue,
    deleteIssueService,
} = require("../services/issueService");

const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/AppError");

const { createActivityService } = require("../services/activityService");

exports.getIssues = asyncHandler(async (req, res) => {
    const issues = await getIssuesService(req.user);

    res.json({
        success: true,
        data: issues,
    });
});

exports.createIssue = asyncHandler(async (req, res) => {
    try {
        const issue = await createIssueService({
            ...req.body,
            createdBy: req.user.id,
        });

        await createActivityService({
            action: "Issue Created",
            entityType: "ISSUE",
            entityId: issue.id,
            performedBy: req.user.id,
        });

        res.json({
            success: true,
            message: "Issue created",
            data: issue,
        });
    } catch (err) {
        const safeMessages = ["Project not found", "User not found"];

        if (safeMessages.includes(err.message)) {
            throw new AppError(err.message, 400);
        }

        throw err;
    }
});

exports.updateIssueStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    await updateIssueStatusService(id, status);

    res.json({
        success: true,
        message: "Status updated",
    });
});

exports.assignIssue = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    const issue = await findIssueById(id);

    if (!issue) {
        throw new AppError("Issue not found", 404);
    }

    await transactionalAssignIssue({
        issueId: id,
        userId,
        issueTitle: issue.title,
    });

    const io = req.app.get("io");

    io.emit("notification");

    res.json({
        success: true,
        message: "Issue assigned successfully",
    });
});

exports.getIssueHistory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const issue = await findIssueById(id);

    res.json({
        success: true,
        message: "Issue history fetched",
        data: issue || [],
    });
});

exports.getDetailedIssues = asyncHandler(async (req, res) => {
    const data = await getDetailedIssuesService();

    res.json({
        success: true,
        data,
    });
});

exports.getFilteredIssues = asyncHandler(async (req, res) => {
    const { page = 1, limit = 5, status, projectId } = req.query;

    const data = await getFilteredIssuesService({
        page,
        limit,
        status,
        projectId,
    });

    res.json({
        success: true,
        page: Number(page),
        limit: Number(limit),
        data,
    });
});

exports.searchIssues = asyncHandler(async (req, res) => {
    const { query } = req.query;

    if (!query) {
        throw new AppError("Search query is required", 400);
    }

    const issues = await searchIssuesService(query, req.user);

    res.json({
        success: true,
        results: issues,
    });
});

exports.deleteIssue = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await deleteIssueService(id);

    res.json({
        success: true,
        message: "Issue deleted successfully",
    });
});