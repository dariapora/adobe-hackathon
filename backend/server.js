const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/db');
const passport = require('./config/passport');
const authRoutes = require('./routes/authRoutes');
// const User = require('./models/userModel');
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
const { Conversation, Message, User } = require('./models');
const { Op } = require('sequelize');

// Store connected users (userId -> socketId mapping)
const connectedUsers = new Map();

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // User joins with their userId
    socket.on('user:join', (userId) => {
        connectedUsers.set(userId, socket.id);
        socket.userId = userId;
        console.log(`User ${userId} joined with socket ${socket.id}`);
    });

    // Join a conversation room
    socket.on('conversation:join', async (conversationId) => {
        try {
            if (!socket.userId) {
                socket.emit('error', { message: 'User not authenticated' });
                return;
            }

            // Verify user is part of this conversation
            const conversation = await Conversation.findOne({
                where: {
                    id: conversationId,
                    [Op.or]: [
                        { user1Id: socket.userId },
                        { user2Id: socket.userId }
                    ]
                }
            });

            if (conversation) {
                socket.join(`conversation:${conversationId}`);
                console.log(`User ${socket.userId} joined conversation ${conversationId}`);
            } else {
                socket.emit('error', { message: 'Not authorized for this conversation' });
            }
        } catch (error) {
            console.error('Error joining conversation:', error);
            socket.emit('error', { message: 'Failed to join conversation' });
        }
    });

    // Leave a conversation room
    socket.on('conversation:leave', (conversationId) => {
        socket.leave(`conversation:${conversationId}`);
        console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Send a message
    socket.on('message:send', async (data) => {
        try {
            const { conversationId, content } = data;
            
            if (!socket.userId) {
                socket.emit('error', { message: 'User not authenticated' });
                return;
            }

            // Verify user is part of this conversation
            const conversation = await Conversation.findOne({
                where: {
                    id: conversationId,
                    [Op.or]: [
                        { user1Id: socket.userId },
                        { user2Id: socket.userId }
                    ]
                }
            });

            if (!conversation) {
                socket.emit('error', { message: 'Not authorized for this conversation' });
                return;
            }

            // Create message
            const message = await Message.create({
                conversationId,
                senderId: socket.userId,
                content
            });

            // Update conversation's lastMessageAt
            await Conversation.update(
                { lastMessageAt: new Date() },
                { where: { id: conversationId } }
            );

            // Get full message with sender info
            const fullMessage = await Message.findByPk(message.id, {
                include: [{
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'first_name', 'last_name', 'profile_picture']
                }]
            });

            // Emit to all users in the conversation room
            io.to(`conversation:${conversationId}`).emit('message:new', fullMessage);
            
            console.log(`Message sent in conversation ${conversationId} by user ${socket.userId}`);
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    // User is typing
    socket.on('typing:start', (conversationId) => {
        socket.to(`conversation:${conversationId}`).emit('typing:user', {
            userId: socket.userId,
            conversationId
        });
    });

    // User stopped typing
    socket.on('typing:stop', (conversationId) => {
        socket.to(`conversation:${conversationId}`).emit('typing:stop', {
            userId: socket.userId,
            conversationId
        });
    });

    socket.on('ping', (payload) => {
        socket.emit('pong', { ok: true, payload });
    });

    socket.on('disconnect', () => {
        if (socket.userId) {
            connectedUsers.delete(socket.userId);
            console.log(`User ${socket.userId} disconnected`);
        }
        console.log('Socket disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 8090;


sequelize.sync({ alter: true }).then(() => {
    console.log('📊 Database synced');
    server.listen(PORT, () => {
        console.log(`Aplicatia ruleaza pe port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to sync database:', err);
});