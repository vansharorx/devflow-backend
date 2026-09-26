const asyncHandler = require("../middleware/asyncHandler");
const { getActivitiesService } = require("../services/activityService");

exports.getActivities = asyncHandler(async (req, res) => {
    const activities = await getActivitiesService();

    res.json({
        success: true,
        data: activities,
    });
});