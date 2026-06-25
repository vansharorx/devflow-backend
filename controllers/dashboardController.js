const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {

        // Total Counts
        const [[userCount]] = await db.promise().query(`
            SELECT COUNT(*) AS totalUsers
            FROM users
            WHERE is_deleted = FALSE
        `);

        const [[projectCount]] = await db.promise().query(`
            SELECT COUNT(*) AS totalProjects
            FROM projects
            WHERE is_deleted = FALSE
        `);

        const [[issueCount]] = await db.promise().query(`
            SELECT COUNT(*) AS totalIssues
            FROM issues
            WHERE is_deleted = FALSE
        `);

        // Issue Status Counts
        const [statusMetrics] = await db.promise().query(`
            SELECT
                status,
                COUNT(*) AS count
            FROM issues
            WHERE is_deleted = FALSE
            GROUP BY status
        `);

        const issuesByStatus = {
            open: 0,
            inProgress: 0,
            closed: 0
        };

        statusMetrics.forEach(item => {

            const status = item.status.toLowerCase();

            if (status === "open") {
                issuesByStatus.open = Number(item.count);
            }

            else if (status === "in progress") {
                issuesByStatus.inProgress = Number(item.count);
            }

            else if (status === "closed") {
                issuesByStatus.closed = Number(item.count);
            }

        });

        // Top Users
        const [topUsers] = await db.promise().query(`
            SELECT
                u.id,
                u.name,
                COUNT(i.id) AS totalIssuesCreated
            FROM users u
            LEFT JOIN issues i
                ON u.id = i.created_by
            WHERE u.is_deleted = FALSE
            GROUP BY u.id
            ORDER BY totalIssuesCreated DESC
            LIMIT 5
        `);

        // Top Projects
        const [topProjects] = await db.promise().query(`
            SELECT
                p.id,
                p.name,
                COUNT(i.id) AS totalIssues
            FROM projects p
            LEFT JOIN issues i
                ON p.id = i.project_id
            WHERE p.is_deleted = FALSE
            GROUP BY p.id
            ORDER BY totalIssues DESC
            LIMIT 5
        `);

        res.json({
            success: true,
            data: {
                totals: {
                    users: userCount.totalUsers,
                    projects: projectCount.totalProjects,
                    issues: issueCount.totalIssues
                },

                issuesByStatus,

                topUsers,

                topProjects
            }
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};