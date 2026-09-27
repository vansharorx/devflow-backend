const { addActivity, getActivities } = require("../models/activityModel");

const createActivityService = async ({
    action,
    entityType,
    entityId,
    performedBy,
}) => {
    const activity = {
        action,
        entityType,
        entityId,
        performedBy,
    };

    const result = await addActivity(activity);

    return {
        id: result.insertId,
        ...activity,
    };
};

const getActivitiesService = async () => {
    return await getActivities();
};

module.exports = {
    createActivityService,
    getActivitiesService,
};