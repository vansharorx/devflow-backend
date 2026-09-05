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

    } 
    
    catch (err) {
        console.error(
            "Failed to fetch activities:",
            err
        );

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};