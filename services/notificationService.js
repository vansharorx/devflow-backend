const {
    createNotification,
    getUserNotifications,
    markNotificationRead,
} = require("../models/notificationModel");

const createNotificationService = async ({ userId, message }) => {
    const notification = {
        userId,
        message,
    };

    const result = await createNotification(notification);

    return {
        id: result.insertId,
        ...notification,
    };
};

const getNotificationsService = async (userId) => {
    return await getUserNotifications(userId);
};

const markReadService = async (id) => {
    return await markNotificationRead(id);
};

module.exports = {
    createNotificationService,
    getNotificationsService,
    markReadService,
};