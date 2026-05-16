const db = require('../config/db');

const addComment = (commentData) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO comments
            (id, issue_id, user_id, comment)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                commentData.id,
                commentData.issueId,
                commentData.userId,
                commentData.comment
            ],
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );
    });
};

const getCommentsByIssue = (issueId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                c.id,
                c.comment,
                c.created_at,
                u.name AS commented_by
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.issue_id = ?
            ORDER BY c.created_at DESC
        `;

        db.query(sql, [issueId], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

module.exports = {
    addComment,
    getCommentsByIssue
};