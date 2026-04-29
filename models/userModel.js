const db = require('../config/db');

const addUser = (user) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO users (id, name, email, password, role)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [user.id, user.name, user.email, user.password, user.role],
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );
    });
};

const getAllUsers = () => {
    return new Promise((resolve, reject) => {
        db.query("SELECT id, name, email, role FROM users", (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

const findUserById = (id) => {
    return new Promise((resolve, reject) => {
        db.query(
            "SELECT id, name, email, role FROM users WHERE id = ?",
            [id],
            (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            }
        );
    });
};

const findUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.query(
            "SELECT * FROM users WHERE email = ?",
            [email],
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
    findUserById,
    findUserByEmail
};