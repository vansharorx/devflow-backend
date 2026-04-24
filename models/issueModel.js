const db = require('../config/db');


const addIssue = (issue) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO issues 
            (id, title, description, project_id, created_by, assigned_to, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                issue.id,
                issue.title,
                issue.description,
                issue.projectId,
                issue.createdBy,
                issue.assignedTo,
                issue.status
            ],
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );
    });
};


const getAllIssues = () => {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM issues", (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};


const findIssueById = (id) => {
    return new Promise((resolve, reject) => {
        db.query(
            "SELECT * FROM issues WHERE id = ?",
            [id],
            (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            }
        );
    });
};


const updateIssueStatus = (id, status) => {
    return new Promise((resolve, reject) => {
        db.query(
            "UPDATE issues SET status = ? WHERE id = ?",
            [status, id],
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );
    });
};

const assignIssue = (id, userId) => {
    return new Promise((resolve, reject) => {
        db.query(
            "UPDATE issues SET assigned_to = ? WHERE id = ?",
            [userId, id],
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );
    });
};
const getDetailedIssues = () => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                i.id,
                i.title,
                i.description,
                i.status,
                i.created_at,
                p.name AS project_name,
                u.name AS created_by_name,
                a.name AS assigned_to_name
            FROM issues i
            LEFT JOIN projects p ON i.project_id = p.id
            LEFT JOIN users u ON i.created_by = u.id
            LEFT JOIN users a ON i.assigned_to = a.id
        `;

        db.query(sql, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};
module.exports = {
    addIssue,
    getAllIssues,
    findIssueById,
    updateIssueStatus,
    assignIssue,
    getDetailedIssues
};