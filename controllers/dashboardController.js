const {

    getDashboardData

} = require("../services/dashboardService");

exports.getDashboardStats = async (

    req,
    res

) => {

    try {

        const dashboardData =
            await getDashboardData();

        res.json({

            success: true,

            data: dashboardData

        });

    }

    catch (err) {

        console.error(
            "Failed to fetch dashboard data:",
            err
        );

        res.status(500).json({

            success: false,

            message: "Internal server error"

        });

    }

};