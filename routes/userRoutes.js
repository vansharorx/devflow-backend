const express = require('express');
const router = express.Router();

const {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    loginUser
} = require('../controllers/userController');

const { body } = require('express-validator');
const validate = require('../middleware/validationMiddleware');

router.get('/', getUsers);

router.post(
    '/',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email required')
    ],
    validate,
    createUser
);
router.post('/login', loginUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;