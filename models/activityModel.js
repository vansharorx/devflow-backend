const db = require('../config/db');

const addActivity = (activity) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO activities
            (id, action, entity_type, entity_id, performed_by)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                activity.id,
                activity.action,
                activity.entityType,
                activity.entityId,
                activity.performedBy
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
            SELECT *
            FROM activities
            ORDER BY created_at DESC
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
    getActivities
};