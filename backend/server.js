const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/db');
const passport = require('./config/passport');
const authRoutes = require('./routes/authRoutes');
const User = require('./models/userModel');
const router = require('./routes/index');
const http = require('http'); // Add this
const { Server } = require('socket.io'); // Add this

const app = express();
const server = http.createServer(app); // Add this
const io = new Server(server, { // Add this
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// ...existing code...
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

const sessionMiddleware = session({ // Modified session setup
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
});

app.use(sessionMiddleware);
io.use((socket, next) => { // Add this
    sessionMiddleware(socket.request, {}, next);
});

// ...existing code...
app.use(passport.initialize());
app.use(passport.session());

app.use("/api", router);
app.use('/auth', authRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('ping', (payload) => {
        socket.emit('pong', { ok: true, payload });
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 8090;

// Sync database and start server
sequelize.sync({ alter: true }).then(() => {
    console.log('📊 Database synced');
    server.listen(PORT, () => {
        console.log(`Aplicatia ruleaza pe port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to sync database:', err);
});