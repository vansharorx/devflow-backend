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

db.getConnection((err, connection) => {

    if (err) {
        console.log("DB connection failed:", err);
        return;
    }

    console.log("MySQL connected");
    connection.release();
});

module.exports = db;