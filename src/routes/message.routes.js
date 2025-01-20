const express = require('express');
const { getAllMessage } = require('../controllers/message.controller');
// const { validate, AuthMiddleware } = require('../middlewares')
// const { registerSchema, getUserSchema, updateUserSchema, deleteUserSchema } = require('../validations/user.validation')

const router = express.Router();

// Define routes
router.get('/message', getAllMessage);
module.exports = router;

