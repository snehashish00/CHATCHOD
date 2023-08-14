const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
// const { Socket } = require('dgram');/


const formatMessage = require('./utils/message');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);


// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord Bot';

// Run when a client connects
io.on('connection', socket => {
    console.log('New WS Connection...');

    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        
        socket.join(user.room);

        // sent a Welcome message to user from server side. [ just the one user that joined/connects ] 
        socket.emit('message', formatMessage(botName, 'Welcome to Chatcord!'));
        
        // Broadcast from server when a user connects. [ all the other user except the one user join]
        socket.broadcast
            .to(user.room)
            .emit(
                'message', 
                formatMessage(botName, `A ${user.username} has joined the chat`)
            );
        
        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
    
    // Listen for chatMessage 
    socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);
    
        io.to(user.room).emit("message", formatMessage(user.username, msg));
      });

    // Runs when the clients disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user) {
            io.to(user.room).emit(
                'message', 
                formatMessage(botName, `${user.username} has left the chat`)
            );

            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});


const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// app.listen(PORT, () => {
//     console.log('Server running on port $(PORT)');
// });