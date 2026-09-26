const asyncHandler = require("../middleware/asyncHandler");
const { getDashboardData } = require("../services/dashboardService");

exports.getDashboardStats = asyncHandler(async (req, res) => {
    const dashboardData = await getDashboardData();

    res.json({
        success: true,
        data: dashboardData,
    });
});