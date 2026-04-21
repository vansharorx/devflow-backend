const db = require('../config/db');

/* CREATE USER */
const addUser = (user) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO users (id, name, email, role)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [user.id, user.name, user.email, user.role],
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );
    });
};

/* GET USERS */
const getAllUsers = () => {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM users", (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

/* FIND USER BY ID */
const findUserById = (id) => {
    return new Promise((resolve, reject) => {
        db.query(
            "SELECT * FROM users WHERE id = ?",
            [id],
            (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            }
        );
    });
};

module.exports = {
    addUser,
    getAllUsers,
    findUserById
};