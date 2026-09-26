const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/AppError");

const {
    createUserService,
    getUsersService,
    loginUserService,
    updateUserService,
    changePasswordService,
    uploadProfileImageService,
    refreshTokenService,
    logoutUserService,
    getCurrentUserService,
} = require("../services/userService");

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/v1/users",
};

exports.getUsers = asyncHandler(async (req, res) => {
    const users = await getUsersService();

    res.json({
        success: true,
        data: users,
    });
});

exports.createUser = asyncHandler(async (req, res) => {
    const user = await createUserService(req.body);

    res.json({
        success: true,
        message: "User created",
        data: user,
    });
});

exports.updateUser = asyncHandler(async (req, res) => {
    const { name, email, role } = req.body;

    const user = await updateUserService(req.params.id, name, email, role);

    res.json({
        success: true,
        message: "User updated successfully",
        data: user,
    });
});

exports.deleteUser = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        message: "deleteUser working",
    });
});

exports.loginUser = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await loginUserService(req.body);

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({
        success: true,
        message: "Login successful",
        accessToken,
        data: user,
    });
});

exports.refreshToken = asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) {
        throw new AppError("Refresh token required", 401);
    }

    const newAccessToken = await refreshTokenService(token);

    res.json({
        success: true,
        accessToken: newAccessToken,
    });
});

exports.logoutUser = asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken;

    await logoutUserService(token);

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/v1/users",
    });

    res.json({
        success: true,
        message: "Logged out successfully",
    });
});

exports.changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    await changePasswordService(req.user.id, currentPassword, newPassword);

    res.json({
        success: true,
        message: "Password changed successfully",
    });
});

exports.uploadProfileImage = asyncHandler(async (req, res) => {
    const imagePath = await uploadProfileImageService(req.user.id, req.file);

    res.status(200).json({
        success: true,
        message: "Profile image updated successfully.",
        profileImage: imagePath,
    });
});

exports.getCurrentUser = asyncHandler(async (req, res) => {
    const user = await getCurrentUserService(req.user.id);

    res.json({
        success: true,
        data: user,
    });
});