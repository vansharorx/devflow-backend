const mysql = require("mysql2");

const config = require("./index");

const db = mysql.createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const connectWithRetry = () => {

    db.getConnection((err, connection) => {

        if (err) {

            console.error(
                `❌ MySQL not ready. Retrying in 5 seconds...`
            );

            setTimeout(
                connectWithRetry,
                5000
            );

            return;

        }

        console.log("✅ MySQL connected");

        connection.release();

    });

};

connectWithRetry();

module.exports = db;