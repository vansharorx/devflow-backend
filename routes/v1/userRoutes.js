/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/authMiddleware');
const authorizeRoles = require('../../middleware/roleMiddleware');
const upload = require('../../middleware/uploadMiddleware');
const { authLimiter } = require('../../middleware/rateLimitMiddleware');

const {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    loginUser,
    refreshToken,
    logoutUser,
    changePassword,
    uploadProfileImage,
    getCurrentUser
} = require('../../controllers/userController');

const { body } = require('express-validator');
const validate = require('../../middleware/validationMiddleware');

router.get("/me", authenticate, getCurrentUser);

router.get(
    '/',
    authenticate,
    authorizeRoles("ADMIN"),
    getUsers
);

router.post(
    '/',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email required')
    ],
    validate,
    createUser
);

// Login Route with Rate Limiter
router.post('/login', authLimiter, loginUser);

router.post('/refresh', refreshToken);

router.post('/logout', logoutUser);

router.put(
    "/change-password",
    authenticate,
    changePassword
);

router.post(
    "/profile-image",
    authenticate,
    upload.single("profileImage"),
    uploadProfileImage
);

router.put(
    '/:id',
    authenticate,
    authorizeRoles("ADMIN"),
    updateUser
);

router.delete(
    '/:id',
    authenticate,
    authorizeRoles("ADMIN"),
    deleteUser
);

module.exports = router;