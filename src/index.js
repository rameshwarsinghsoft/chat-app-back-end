require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const app = require('./app');
const port = process.env.PORT || 4000;
const server = http.createServer(app);
const { Message } = require('./models/index')
app.use(cors());

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

let userSocketMap = {};  // Store mapping of user IDs to socket IDs

// Mock function to simulate getting a user ID from username (replace with real database logic)
const getUserIdFromUsername = (username) => {
    // In a real application, you would fetch the user ID from a database
    // For simplicity, assume the username is the user ID.
    return username;  // Just returning the username for this example
};

io.on('connection', (socket) => {
    console.log('User connected: index ' + socket.id);

    // When a user sets their username (after login, for example), associate their socket ID with their user ID
    socket.on('set_username', (username) => {
        console.log('set_username : ' + username);
        const userId = getUserIdFromUsername(username);

        // Map the user ID to the socket ID
        userSocketMap[userId] = socket.id;

        console.log(`User ${username} connected with socket ID: ${socket.id}`);
        console.log("userSocketMap : ", userSocketMap)
    });

    // Handle message sending
    socket.on('send_message', async (messageData) => {
        const { senderId, receiverEmail } = messageData;

        // Get the receiver's socket ID from the map
        const receiverSocketId = userSocketMap[receiverEmail];

        // Find the sender's email using the socket ID
        const senderEmail = Object.keys(userSocketMap).find(email => userSocketMap[email] === senderId);

        console.log("userSocketMap : ", userSocketMap)

        // Send the message to the receiver if they are connected
        if (receiverSocketId) {
            messageData.receiverSocketId = receiverSocketId;
            messageData.senderEmail = senderEmail;
            console.log("messageData is : ", messageData)
            io.to(receiverSocketId).emit('receive_message', messageData);
        }

        let data = await Message.create({
            senderEmail,
            receiverEmail,
            message: messageData.message,
        })
        console.log("data : ", data)
    });

    // Clean up when the user disconnects
    socket.on('disconnect', () => {
        // Remove the user from the socket map when they disconnect
        for (let userId in userSocketMap) {
            if (userSocketMap[userId] === socket.id) {
                delete userSocketMap[userId];
                console.log(`User with socket ID: ${socket.id} disconnected`);
            }
        }
    });
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
