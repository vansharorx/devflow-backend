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

    // Only allow the authenticated user to update their own notification.
    const result = await markReadService(id, req.user.id);

    if (!result.affectedRows) {
        const AppError = require("../utils/AppError");
        throw new AppError("Notification not found", 404);
    }

    const io = req.app.get("io");

    if (io) {
        io.to(`user:${String(req.user.id)}`).emit("notification", {
            type: "notification_read",
            notificationId: id,
        });
    }

    res.json({
        success: true,
        message: "Notification marked as read",
    });
});