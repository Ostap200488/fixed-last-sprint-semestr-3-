const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server);

let connectedUsers = [];

io.on('connection', (socket) => {
    socket.on('join', (username) => {
        connectedUsers.push({ username, id: socket.id });
        io.emit('userList', connectedUsers.map(user => user.username));
        io.emit('notification', `${username} joined the chat`);
    });

    socket.on('sendMessage', (message, sender) => {
        io.emit('newMessage', { sender, content: message });
    });

    socket.on('disconnect', () => {
        connectedUsers = connectedUsers.filter(user => user.id !== socket.id);
        io.emit('userList', connectedUsers.map(user => user.username));
    });
});


server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
