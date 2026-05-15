const {
    getActivitiesService
} = require('../services/activityService');

exports.getActivities = async (req, res) => {
    try {
        const activities = await getActivitiesService();

        res.json({
            success: true,
            data: activities
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};