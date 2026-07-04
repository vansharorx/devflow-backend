const db = require("../config/db");

const getTotalCounts = async () => {

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

    return {

        users: userCount.totalUsers,
        projects: projectCount.totalProjects,
        issues: issueCount.totalIssues

    };

};

const getIssueStatus = async () => {

    const [rows] = await db.promise().query(`
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

    rows.forEach(row => {

        switch (row.status.toLowerCase()) {

            case "open":

                issuesByStatus.open = Number(row.count);
                break;

            case "in progress":

                issuesByStatus.inProgress = Number(row.count);
                break;

            case "closed":

                issuesByStatus.closed = Number(row.count);
                break;

        }

    });

    return issuesByStatus;

};

const getTopUsers = async () => {

    const [rows] = await db.promise().query(`
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

    return rows;

};

const getTopProjects = async () => {

    const [rows] = await db.promise().query(`
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

    return rows;

};

const getWeeklyActivity = async () => {

    const [rows] = await db.promise().query(`

        SELECT

            DATE(created_at) AS day,

            COUNT(*) AS issues

        FROM issues

        WHERE

            created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)

            AND is_deleted = FALSE

        GROUP BY DATE(created_at)

        ORDER BY day ASC

    `);

    return rows;

};

const getProjectProgress = async () => {

    const [rows] = await db.promise().query(`

        SELECT

            p.id,

            p.name,

            COUNT(i.id) AS totalIssues,

            SUM(

                CASE

                    WHEN i.status='CLOSED'

                    THEN 1

                    ELSE 0

                END

            ) AS completedIssues

        FROM projects p

        LEFT JOIN issues i

            ON p.id=i.project_id

        WHERE p.is_deleted=FALSE

        GROUP BY p.id

        ORDER BY p.name

    `);

    return rows.map(project => ({

        id: project.id,

        name: project.name,

        progress:

            project.totalIssues === 0

                ? 0

                : Math.round(

                    (project.completedIssues /

                        project.totalIssues) * 100

                )

    }));

};

const getRecentActivities = async () => {

    const [rows] = await db.promise().query(`

        SELECT

            action,

            entity_type,

            entity_id,

            created_at

        FROM activities

        ORDER BY created_at DESC

        LIMIT 10

    `);

    return rows;

};

module.exports = {

    getTotalCounts,
    getIssueStatus,
    getTopUsers,
    getTopProjects,
    getWeeklyActivity,
    getProjectProgress,
    getRecentActivities

};