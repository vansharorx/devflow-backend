const {

    getTotalCounts,
    getIssueStatus,
    getTopUsers,
    getTopProjects,
    getWeeklyActivity,
    getProjectProgress,
    getRecentActivities

} = require("../models/dashboardModel");

const getDashboardData = async () => {

    const [

        totals,
        issuesByStatus,
        topUsers,
        topProjects,
        weeklyActivity,
        projectProgress,
        recentActivities

    ] = await Promise.all([

        getTotalCounts(),
        getIssueStatus(),
        getTopUsers(),
        getTopProjects(),
        getWeeklyActivity(),
        getProjectProgress(),
        getRecentActivities()

    ]);

    return {

        totals,
        issuesByStatus,
        weeklyActivity,
        projectProgress,
        recentActivities,
        topUsers,
        topProjects

    };

};

module.exports = {

    getDashboardData

};