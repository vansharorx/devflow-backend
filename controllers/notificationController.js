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
        console.error(
            "Failed to fetch notifications:",
            err
        );

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        await markReadService(id);

        const io = req.app.get("io");
        io.emit("notification");

        res.json({
            success: true,
            message: "Notification marked as read"
        });

    } catch (err) {
        console.error(
            "Failed to mark notification as read:",
            err
        );

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};