const jwt = require("jsonwebtoken");
const { findUserById } = require("../models/userModel");

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check if Authorization header exists and is in the correct format
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "No token provided",
            });
        }

        // Extract JWT token
        const token = authHeader.substring(7);

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user
        const user = await findUserById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        // Attach authenticated user to request
        req.user = user;

        next();
    } catch (err) {
        console.error("Authentication failed:", err.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

module.exports = authenticate;