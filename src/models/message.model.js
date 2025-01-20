const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    senderEmail: {
        type: String,
        required: true,
        trim: true,
    },
    receiverEmail: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        required: true
    },
    seen: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
