const express = require('express');
const router = express.Router();

const {
    getUsers,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/userController');

const { body } = require('express-validator');

router.get('/', getUsers);

router.post(
    '/',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email required')
    ],
    createUser
);

router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;