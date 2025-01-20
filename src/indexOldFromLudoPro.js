require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const app = require('./app');
const port = process.env.PORT || 8000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Middleware for token validation
io.use((socket, next) => {
    const token = socket.handshake.query.token;

    if (!token) {
        return next(new Error('Authentication error: Token is missing'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
        socket.user = decoded;
        console.log("user : ",decoded)
        next();
    } catch (err) {
        return next(new Error('Authentication error: Invalid token'));
    }
});

let sockets = {}; // Object to store socket connections by user ID
let onlineUser = []; // Array to store online users

io.on('connection', (socket) => {
    console.log("socket.rooms :: ",socket.rooms);
    console.log('A user connected:', socket.id);

    if (socket.user) {
        console.log('Authenticated user:', socket.id);

        const logUserId = socket.user._id; // Assuming the user ID is stored in the decoded token

        // Add user to the online users list if not already present
        if (onlineUser.indexOf(logUserId) === -1) {
            onlineUser.push(logUserId);
        }

        // Map the user's socket connection to their ID
        let newobj = {};
        newobj[logUserId] = socket;
        if (!sockets[logUserId]) {
            console.log(1)
            sockets[logUserId] = [];
        }
        sockets[logUserId].push(newobj);

        // Logging the connections
        console.log('************* Start ***********');
        console.log("onlineUser connection ", onlineUser);
        console.log('************* End *************');
    }

    // Automatically emit the 'welcome' event to the client
    socket.emit('all-online-user', `Welcome to the WebSocket server, All online user ${onlineUser   }`);

    // Listen for the 'hello' event from the client
    socket.on('hello', (msg) => {
        console.log('User message:', msg);

        // Send a response back to the client with the user's email
        const userEmail = socket.user?.email || 'guest';
        socket.emit('response', `Hello, ${userEmail}! You said: ${msg}`);
    });

    // Listen for client disconnection
    socket.on('disconnect', (reason) => {
        console.log('User disconnected:', socket.id, '| Reason:', reason);

        if (socket.user) {
            const logUserId = socket.user.id;
            // Remove user from onlineUser and sockets list
            onlineUser = onlineUser.filter(id => id !== logUserId);
            delete sockets[logUserId];
        }
        socket.broadcast.emit('userLeft', `${socket.id} has left`);
    });

    // Listen for connection errors
    socket.on('connect_error', (err) => {
        console.error('Connection error:', err.message);
    });
});


// // app.listen(port, () => {
// //     console.log(`Server is running on http://localhost:${port}`);
// // });

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});