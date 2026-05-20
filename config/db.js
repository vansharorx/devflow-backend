const mysql = require('mysql2');
const config = require('./index');

const db = mysql.createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database
});

db.connect((err) => {
    if (err) {
        console.error("DB connection failed:", err);
        return;
    }
    console.log("MySQL connected");
});

module.exports = db;