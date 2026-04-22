const db = require('../config/db');

const addProject = (project) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO projects (id, name, description, created_by)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [project.id, project.name, project.description, project.createdBy],
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );
    });
};

const getAllProjects = () => {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM projects", (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

const findProjectById = (id) => {
    return new Promise((resolve, reject) => {
        db.query(
            "SELECT * FROM projects WHERE id = ?",
            [id],
            (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            }
        );
    });
};

module.exports = {
    addProject,
    getAllProjects,
    findProjectById
};