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

    async countAllUserMessage(receiverEmail) {
        try {
            const messages = await Message.find({ receiverEmail: receiverEmail, seen: false });

            // Count messages grouped by senderEmail
            const messageCountsBySender = messages.reduce((acc, message) => {
                acc[message.senderEmail] = (acc[message.senderEmail] || 0) + 1;
                return acc;
            }, {});

            return ServiceResponse(true, StatusCodes.OK, "Fetched all messages successfully.", messageCountsBySender);
        } catch (error) {
            console.error("Error fetching message:", error);
            CatchError(error);
        }
    }

    async perticularUserAllMessageSeen(senderEmail, receiverEmail) {
        try {
            // Update all messages from the sender to the receiver
            const messagesSeen = await Message.updateMany(
                { senderEmail: senderEmail, receiverEmail: receiverEmail, seen: false },
                { $set: { seen: true } }
            );

            return ServiceResponse(true, StatusCodes.OK, "User messages marked as seen.", messagesSeen);
        } catch (error) {
            console.error("Error updating messages:", error);
            CatchError(error);
        }
    }

    async updateMessage(_id, updateMsg) {
        try {
            const updateData = { message: updateMsg };
            const data = await Message.findOneAndUpdate(
                { _id: _id },    // Filter to find the message by ID
                updateData,      // The update data
                { new: true }     // Ensure the returned data is the updated version
            );
            if (!data) {
                return ServiceResponse(false, StatusCodes.NOT_FOUND, "Message not found with the provided message ID.");
            }
            return ServiceResponse(true, StatusCodes.OK, "Message updated successfully.", data);
        } catch (error) {
            console.error("Error updating message:", error);
            return CatchError(error);
        }
    }
    
    async deleteMessage(_id) {
        try {
            let message = await Message.findOne({ _id: _id });
            if (!message) {
                return ServiceResponse(false, StatusCodes.NOT_FOUND, "Message not found with the provided message ID.");
            }
            await Message.deleteOne({ _id: _id });
            return ServiceResponse(true, StatusCodes.OK, "Message deleted successfully.");
        } catch (error) {
            console.error("Error deleting message:", error);
            CatchError(error);
        }
    }

}

module.exports = new MessageService();