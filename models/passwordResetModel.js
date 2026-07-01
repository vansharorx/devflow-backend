const db = require("../config/db");

const saveResetToken = ({
    id,
    userId,
    token,
    expiresAt
}) => {

    return new Promise((resolve, reject) => {

        db.query(

            `
            INSERT INTO password_reset_tokens
            (id, user_id, token, expires_at)
            VALUES (?, ?, ?, ?)
            `,

            [
                id,
                userId,
                token,
                expiresAt
            ],

            (err, result) => {

                if (err)
                    return reject(err);

                resolve(result);

            }

        );

    });

};

const findResetToken = (token) => {

    return new Promise((resolve, reject) => {

        db.query(

            `
            SELECT *
            FROM password_reset_tokens
            WHERE token = ?
            `,

            [token],

            (err, results) => {

                if (err)
                    return reject(err);

                resolve(results[0]);

            }

        );

    });

};

const deleteResetToken = (token) => {

    return new Promise((resolve, reject) => {

        db.query(

            `
            DELETE
            FROM password_reset_tokens
            WHERE token = ?
            `,

            [token],

            (err, result) => {

                if (err)
                    return reject(err);

                resolve(result);

            }

        );

    });

};

module.exports = {

    saveResetToken,
    findResetToken,
    deleteResetToken

};