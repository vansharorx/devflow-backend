const db = require('../config/db');

const saveRefreshToken = (userId, token) => {
    return new Promise((resolve, reject) => {
        db.query(
            "INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)",
            [userId, token],
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );
    });
};

const findToken = (token) => {
    return new Promise((resolve, reject) => {
        db.query(
            "SELECT * FROM refresh_tokens WHERE token = ?",
            [token],
            (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            }
        );
    });
};

const deleteToken = (token) => {
    return new Promise((resolve, reject) => {
        db.query(
            "DELETE FROM refresh_tokens WHERE token = ?",
            [token],
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );
    });
};

module.exports = {
    saveRefreshToken,
    findToken,
    deleteToken
};