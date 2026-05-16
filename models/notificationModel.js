const db = require('../config/db');

const createNotification = (notification) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO notifications
            (id, user_id, message)
            VALUES (?, ?, ?)
        `;

        db.query(
            sql,
            [
                notification.id,
                notification.userId,
                notification.message
            ],
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );
    });
};

const getUserNotifications = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT *
            FROM notifications
            WHERE user_id = ?
            ORDER BY created_at DESC
        `;

        db.query(sql, [userId], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

const markNotificationRead = (id) => {
    return new Promise((resolve, reject) => {
        db.query(
            `
            UPDATE notifications
            SET is_read = TRUE
            WHERE id = ?
            `,
            [id],
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );
    });
};

module.exports = {
    createNotification,
    getUserNotifications,
    markNotificationRead
};