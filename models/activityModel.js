const db = require("../config/db");

const addActivity = (activity) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO activities
            (action, entity_type, entity_id, performed_by)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                activity.action,
                activity.entityType,
                activity.entityId,
                activity.performedBy,
            ],
            (err, result) => {
                if (err) return reject(err);

                resolve(result);
            }
        );
    });
};

const getActivities = () => {
    return new Promise((resolve, reject) => {
        db.query(
            `
            SELECT
                a.id,
                a.action,
                a.entity_type,
                a.entity_id,
                a.performed_by,
                u.name AS performed_by_name,
                a.created_at
            FROM activities a
            LEFT JOIN users u ON a.performed_by = u.id
            ORDER BY a.created_at DESC
            `,
            (err, results) => {
                if (err) return reject(err);
                resolve(results);
            }
        );
    });
};

module.exports = {
    addActivity,
    getActivities,
};
