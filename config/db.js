const mysql = require('mysql2');
const config = require('./index');

let db;

const connectDB = () => {

    db = mysql.createConnection({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database
    });

    db.connect((err) => {

        if (err) {

            console.log(
                "DB not ready. Retrying in 5 seconds..."
            );

            setTimeout(connectDB, 5000);

            return;
        }

        console.log("MySQL connected");
    });
};

connectDB();

module.exports = () => db;