const {
    getNotificationsService,
    markReadService
} = require('../services/notificationService');

exports.getNotifications = async (req, res) => {
    try {
        const notifications =
            await getNotificationsService(req.user.id);

        res.json({
            success: true,
            data: notifications
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        await markReadService(id);

        res.json({
            success: true,
            message: "Notification marked as read"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};