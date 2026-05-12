const { getAllUsers } = require('../models/userModel');
const { getAllProjects } = require('../models/projectModel');
const { getAllIssues } = require('../models/issueModel');

exports.getDashboardStats = async (req, res) => {
    try {
        const users = await getAllUsers();
        const projects = await getAllProjects();
        const issues = await getAllIssues();

        const openIssues =
            issues.filter(i => i.status === 'OPEN').length;

        const inProgressIssues =
            issues.filter(i => i.status === 'IN_PROGRESS').length;

        const closedIssues =
            issues.filter(i => i.status === 'CLOSED').length;

        const stats = {
            totalUsers: users.length,
            totalProjects: projects.length,
            totalIssues: issues.length,

            issueStatus: {
                OPEN: openIssues,
                IN_PROGRESS: inProgressIssues,
                CLOSED: closedIssues
            }
        };

        res.json({
            success: true,
            data: stats
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};