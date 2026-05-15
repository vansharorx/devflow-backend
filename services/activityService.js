const {
    addActivity,
    getActivities
} = require('../models/activityModel');

const createActivityService = async ({
    action,
    entityType,
    entityId,
    performedBy
}) => {
    const activity = {
        id: Date.now(),
        action,
        entityType,
        entityId,
        performedBy
    };

    await addActivity(activity);
};

const getActivitiesService = async () => {
    return await getActivities();
};

module.exports = {
    createActivityService,
    getActivitiesService
};