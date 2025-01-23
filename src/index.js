require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const app = require('./app');
const port = process.env.PORT || 4000;
const server = http.createServer(app);
const { Message, User } = require('./models/index');
app.use(cors());

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

let onlineUsers = {};
const allUsers = () => {
    // Fetch users once when updating the status
    User.find()
        .then(users => {
            const updatedUsers = users.map(user => {
                let updatedUser = user._doc ? { ...user._doc } : { ...user };
                updatedUser.online = !!onlineUsers[updatedUser.email];
                return updatedUser;
            });

            // Emit updated users list to all clients
            io.emit('all_users', updatedUsers);
        })
        .catch(err => {
            console.error('Error fetching users:', err);
        });
};

io.on('connection', (socket) => {
    console.log('User connected: ' + socket.id);

    // When a user sets their username, associate their socket ID with their user email
    socket.on('set_username', (username) => {
        console.log(`User ${username} connected with socket ID: ${socket.id}`);
        onlineUsers[username] = socket.id; // Store the email as the key

        // Emit the user list with online status
        allUsers();
    });

    socket.on('send_message', async (messageData) => {
        const { senderId, receiverEmail } = messageData;
        const receiverSocketId = onlineUsers[receiverEmail];

        // Find sender's email from socket ID
        const senderEmail = Object.keys(onlineUsers).find(email => onlineUsers[email] === senderId);

        if (receiverSocketId) {
            messageData.receiverSocketId = receiverSocketId;
            messageData.senderEmail = senderEmail;
            // Emit message to receiver
            io.to(receiverSocketId).emit('receive_message', messageData);
        }

        // Save message to database asynchronously
        try {
            let data = await Message.create({
                senderEmail,
                receiverEmail,
                message: messageData.message,
            });
            console.log("Message saved:", data);
        } catch (err) {
            console.error('Error saving message:', err);
        }
    });

    socket.on('delete_message', (data) => {
        const receiverSocketId = onlineUsers[data.receiverEmail];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('delete_reflect', "messageData");
        }
    });

    socket.on('update_message', (data) => {
        const receiverSocketId = onlineUsers[data.receiverEmail];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('update_reflect', "messageData");
        }
    });

    socket.on('disconnect', () => {
        // Remove the user from onlineUsers when they disconnect
        const disconnectedUser = Object.keys(onlineUsers).find(email => onlineUsers[email] === socket.id);
        if (disconnectedUser) {
            delete onlineUsers[disconnectedUser];
            console.log(`User with socket ID: ${socket.id} disconnected`);

            // Emit the user list with online status
            allUsers();
        }
    });
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
