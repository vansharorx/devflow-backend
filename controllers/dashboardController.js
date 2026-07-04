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

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};