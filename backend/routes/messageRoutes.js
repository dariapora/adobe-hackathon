const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Not authenticated' });
};

// Get all conversations for the current user
router.get('/conversations', isAuthenticated, messageController.getUserConversations);

// Get or create a conversation with another user
router.post('/conversations', isAuthenticated, messageController.getOrCreateConversation);

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', isAuthenticated, messageController.getConversationMessages);

module.exports = router;
