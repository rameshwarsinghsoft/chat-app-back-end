const { MessageService } = require('../services');
const { ApiResponse } = require('../utils/Response');
const { StatusCodes } = require('http-status-codes');

class MessageController {

    async getAllMessage(req, res) {
        const senderEmail = req.query.senderEmail;
        const receiverEmail = req.query.receiverEmail;
        console.log("senderEmail : ", senderEmail)
        console.log("receiverEmail : ", receiverEmail)

        if (!senderEmail || !receiverEmail) {
            return ApiResponse(res, StatusCodes.BAD_REQUEST, "Both senderEmail and receiverEmail are required.");
        }
        try {
            const message = await MessageService.getAllMessage(senderEmail, receiverEmail);
            return ApiResponse(res, message.status, message.message, message.success ? message.data : undefined);
        } catch (error) {
            return ApiResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, error.toString());
        }
    }

    async getAllUserUnreadMessage(req, res) {
        const receiverEmail = req.query.receiverEmail;

        if (!receiverEmail) {
            return ApiResponse(res, StatusCodes.BAD_REQUEST, "A receiverEmail are required.");
        }
        try {
            const message = await MessageService.countAllUserMessage(receiverEmail);

            return ApiResponse(res, message.status, message.message, message.success ? message.data : undefined);
        } catch (error) {
            return ApiResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, error.toString());
        }
    }

    async perticularUserAllMessageSeen(req, res) {
        const senderEmail = req.query.senderEmail;
        const receiverEmail = req.query.receiverEmail;

        if (!senderEmail || !receiverEmail) {
            return ApiResponse(res, StatusCodes.BAD_REQUEST, "Both senderEmail and receiverEmail are required.");
        }
        try {
            const message = await MessageService.perticularUserAllMessageSeen(senderEmail, receiverEmail);
            return ApiResponse(res, message.status, message.message, message.success ? message.data : undefined);
        } catch (error) {
            return ApiResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, error.toString());
        }
    }

    async updateMessage(req, res) {
        const _id = req.body._id;
        const messageContent = req.body.message;
        try {
            const message = await MessageService.updateMessage(_id, messageContent);
            return ApiResponse(res, message.status, message.message, message.success ? message.data : undefined);
        } catch (error) {
            return ApiResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, error.toString());
        }
    }    

    async deleteMessage(req, res) {
        const _id = req.params._id;
        try {
            const message = await MessageService.deleteMessage(_id);
            return ApiResponse(res, message.status, message.message, message.success ? message.data : undefined);
        } catch (error) {
            return ApiResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, error.toString());
        }
    }

}

module.exports = new MessageController();