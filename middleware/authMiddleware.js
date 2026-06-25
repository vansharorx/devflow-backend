const jwt = require('jsonwebtoken');
const { findUserById } = require('../models/userModel');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log("Authorization Header:", authHeader);

        const token = authHeader.split(" ")[1];
        console.log("Token:", token);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await findUserById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = user; 
        console.log("Authenticated User:", req.user);
        next();
    } catch (err) {
        console.log(err);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = authenticate;