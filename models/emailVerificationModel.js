const db = require("../config/db");

const saveVerificationToken = ({

    id,
    userId,
    token,
    expiresAt

}) => {

    return new Promise((resolve, reject) => {

        db.query(

            `
            INSERT INTO email_verification_tokens
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

                if (err) return reject(err);

                resolve(result);

            }

        );

    });

};

const findVerificationToken = (token) => {

    return new Promise((resolve, reject) => {

        db.query(

            `
            SELECT *
            FROM email_verification_tokens
            WHERE token = ?
            `,

            [token],

            (err, results) => {

                if (err) return reject(err);

                resolve(results[0]);

            }

        );

    });

};

const deleteVerificationToken = (token) => {

    return new Promise((resolve, reject) => {

        db.query(

            `
            DELETE
            FROM email_verification_tokens
            WHERE token = ?
            `,

            [token],

            (err, result) => {

                if (err) return reject(err);

                resolve(result);

            }

        );

    });

};

module.exports = {

    saveVerificationToken,
    findVerificationToken,
    deleteVerificationToken

};