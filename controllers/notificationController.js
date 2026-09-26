const asyncHandler = require("../middleware/asyncHandler");

const {
    getNotificationsService,
    markReadService,
} = require("../services/notificationService");

exports.getNotifications = asyncHandler(async (req, res) => {
    const notifications = await getNotificationsService(req.user.id);

    res.json({
        success: true,
        data: notifications,
    });
});

exports.markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await markReadService(id);

    const io = req.app.get("io");

    io.emit("notification");

    res.json({
        success: true,
        message: "Notification marked as read",
    });
});