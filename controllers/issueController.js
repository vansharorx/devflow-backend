const { addIssue, getAllIssues } = require('../models/issueModel');

exports.getIssues = (req, res) => {
    res.json({
        message: "Issues fetched successfully",
        data: getAllIssues()
    });
};

exports.createIssue = (req, res) => {
    const { title, description, projectId, createdBy, status } = req.body;

    if (!title || !projectId || !createdBy) {
        return res.status(400).json({
            message: "Title, projectId and createdBy are required"
        });
    }

    const newIssue = {
        id: Date.now(),
        title,
        description,
        projectId,
        createdBy,
        status: status || "OPEN",
        createdAt: new Date()
    };

    addIssue(newIssue);

    res.json({
        message: "Issue created successfully",
        data: newIssue
    });
};