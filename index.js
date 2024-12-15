const express = require('express');
const expressWs = require('express-ws');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');

const PORT = 3000;
const MONGO_URI = 'mongodb://localhost:27017/chat_app';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

const app = express();
expressWs(app);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(
    session({
        secret: 'chat-app-secret',
        resave: false,
        saveUninitialized: true,
    })
);


const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('User', userSchema);

const messageSchema = new mongoose.Schema({
    username: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model('Message', messageSchema);


let connectedClients = [];
app.ws('/ws', (socket, req) => {
    if (!req.session.user) return socket.close();

    const username = req.session.user.username;
    connectedClients.push({ username, socket });

    broadcast({ type: 'notification', message: `User ${username} has joined the chat!` });

    socket.on('message', async (rawMessage) => {
        const parsedMessage = JSON.parse(rawMessage);
        const message = {
            type: 'chat',
            username,
            text: parsedMessage.text,
            timestamp: new Date().toLocaleTimeString(),
        };

        await Message.create({ username, text: parsedMessage.text });
        broadcast(message);
    });

    socket.on('close', () => {
        connectedClients = connectedClients.filter(client => client.socket !== socket);
        broadcast({ type: 'notification', message: `User ${username} has left the chat.` });
    });
});

function broadcast(message) {
    connectedClients.forEach(client => client.socket.send(JSON.stringify(message)));
}


app.get('/', (req, res) => {
    const onlineUsers = connectedClients.length;
    res.render('index/unauthenticated', { onlineUsers });
});

app.get('/login', (req, res) => {
    res.render('login', { errorMessage: null });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.render('login', { errorMessage: 'Invalid username or password' });
    }
    req.session.user = {
        username: user.username,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
    };
    if (user.isAdmin) {
        res.redirect('/admin');
    } else {
        res.redirect('/chat');
    }
});

app.get('/signup', (req, res) => {
    res.render('signup', { errorMessage: null });
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.render('signup', { errorMessage: 'Username is already taken' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword });
    res.redirect('/login');
});

app.get('/chat', async (req, res) => {
    if (req.session && req.session.user) {
        const messages = await Message.find().sort({ timestamp: -1 }).limit(50).lean();
        res.render('chat', { user: req.session.user, messages: messages.reverse() });
    } else {
        res.redirect('/login');
    }
});

app.get('/profile', (req, res) => {
    if (req.session && req.session.user) {
        res.render('profile', { user: req.session.user });
    } else {
        res.redirect('/login');
    }
});

app.get('/admin', async (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) return res.redirect('/login');
    try {
        const users = await User.find().lean();
        res.render('admin', { users, errorMessage: null });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.render('admin', { users: [], errorMessage: 'Failed to fetch users. Please try again later.' });
    }
});

app.post('/admin/ban', async (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) return res.redirect('/login');
    const { userId } = req.body;

    try {
        await User.findByIdAndDelete(userId);
        res.redirect('/admin');
    } catch (error) {
        console.error('Error banning/removing user:', error);
        const users = await User.find().lean();
        res.render('admin', { users, errorMessage: 'Failed to remove user. Please try again later.' });
    }
});


async function createAdminUser() {
    try {
        const adminExists = await User.findOne({ username: ADMIN_USERNAME });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
            await User.create({
                username: ADMIN_USERNAME,
                password: hashedPassword,
                isAdmin: true,
            });
            console.log('Admin user created successfully');
        } else {
            console.log('Admin user already exists');
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
}
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Could not log out, please try again');
        }
        res.redirect('/login');
    });
});


mongoose
    .connect(MONGO_URI)
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
        createAdminUser();
    })
    .catch(err => console.error('MongoDB connection error:', err));
