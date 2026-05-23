const cron = require('node-cron');
const db = require('../config/db');

/*
    Runs every day at midnight
*/
const startCleanupJob = () => {

    cron.schedule('0 0 * * *', async () => {

        console.log('Running cleanup job...');

        try {
            // Delete notifications older than 30 days
            await db.promise().query(`
                DELETE FROM notifications
                WHERE created_at < NOW() - INTERVAL 30 DAY
            `);

            console.log('Old notifications cleaned');

        } catch (err) {

            console.error('Cleanup job failed:', err.message);
        }
    });
};

module.exports = startCleanupJob;