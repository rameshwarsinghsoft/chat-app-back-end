const express = require('express');
const { getAllMessage, getAllUserUnreadMessage, perticularUserAllMessageSeen } = require('../controllers/message.controller');
// const { validate, AuthMiddleware } = require('../middlewares')
// const { registerSchema, getUserSchema, updateUserSchema, deleteUserSchema } = require('../validations/user.validation')

const router = express.Router();

// Define routes
router.get('/message', getAllMessage);
router.get('/message/unread', getAllUserUnreadMessage);
router.put('/message/mark-read', perticularUserAllMessageSeen);

module.exports = router;

