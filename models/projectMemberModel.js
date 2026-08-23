const db = require('../config/db');

const isProjectMember = (projectId, userId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 1
            FROM project_members
            WHERE project_id = ?
            AND user_id = ?
            LIMIT 1
        `;

        db.query(
            sql,
            [projectId, userId],
            (err, results) => {
                if (err) return reject(err);

                resolve(results.length > 0);
            }
        );
    });
};

const addProjectMember = (projectId, userId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO project_members
            (project_id, user_id)
            VALUES (?, ?)
        `;

        db.query(
            sql,
            [projectId, userId],
            (err, result) => {
                if (err) return reject(err);

                resolve(result);
            }
        );
    });
};

module.exports = {
    isProjectMember,
    addProjectMember
};