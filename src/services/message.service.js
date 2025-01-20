const CrudRepository = require('../repositories/crud.repository');
const { StatusCodes } = require('http-status-codes');
const { Message } = require('../models');
const { ServiceResponse } = require('../utils/Response');
const { CatchError } = require('../utils/Response');

const MessageRepository = new CrudRepository(Message);

class MessageService {

    async getAllMessage(senderEmail, receiverEmail) {
        try {
            // const criteria = email ? { email } : null;
            
            // const users = await MessageRepository.find(criteria);
            const messages = await Message.find({
                $or: [
                    { senderEmail, receiverEmail },  // Sender -> Receiver
                    { senderEmail: receiverEmail, receiverEmail: senderEmail }  // Receiver -> Sender
                ]
            }).sort({ timestamp: 1 });
            if (messages.length > 0) {
                return ServiceResponse(true, StatusCodes.OK, "Fetched all message successfully.", messages)
            } else {
                return ServiceResponse(false, StatusCodes.NOT_FOUND, "No message found.")
            }
        } catch (error) {
            console.error("Error fetching message:", error);
            CatchError(error);
        }
    }
}

module.exports = new MessageService();