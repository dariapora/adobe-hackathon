const { Conversation, Message, User } = require('../models');
const { Op } = require('sequelize');

// Get all conversations for a user (1-1 only)
const getUserConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await Conversation.findAll({
            where: {
                [Op.or]: [
                    { user1Id: userId },
                    { user2Id: userId }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'user1',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'profile_picture']
                },
                {
                    model: User,
                    as: 'user2',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'profile_picture']
                },
                {
                    model: Message,
                    as: 'messages',
                    limit: 1,
                    order: [['createdAt', 'DESC']],
                    include: [{
                        model: User,
                        as: 'sender',
                        attributes: ['id', 'first_name', 'last_name']
                    }]
                }
            ],
            order: [['lastMessageAt', 'DESC']]
        });

        // Format conversations to include the "other user"
        const formattedConversations = conversations.map(conv => {
            const otherUser = conv.user1Id === userId ? conv.user2 : conv.user1;
            return {
                id: conv.id,
                otherUser,
                lastMessage: conv.messages[0] || null,
                lastMessageAt: conv.lastMessageAt,
                createdAt: conv.createdAt,
                updatedAt: conv.updatedAt
            };
        });

        res.json(formattedConversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
};

// Get or create a 1-1 conversation
const getOrCreateConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { otherUserId } = req.body;

        if (!otherUserId) {
            return res.status(400).json({ error: 'otherUserId is required' });
        }

        if (userId === otherUserId) {
            return res.status(400).json({ error: 'Cannot create conversation with yourself' });
        }

        // Check if conversation already exists
        const existingConversation = await Conversation.findOne({
            where: {
                [Op.or]: [
                    { user1Id: userId, user2Id: otherUserId },
                    { user1Id: otherUserId, user2Id: userId }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'user1',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'profile_picture']
                },
                {
                    model: User,
                    as: 'user2',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'profile_picture']
                }
            ]
        });

        if (existingConversation) {
            const otherUser = existingConversation.user1Id === userId ? 
                existingConversation.user2 : existingConversation.user1;
            return res.json({
                id: existingConversation.id,
                otherUser,
                lastMessageAt: existingConversation.lastMessageAt,
                createdAt: existingConversation.createdAt
            });
        }

        // Create new conversation
        const conversation = await Conversation.create({
            user1Id: userId,
            user2Id: otherUserId,
            lastMessageAt: new Date()
        });

        const fullConversation = await Conversation.findByPk(conversation.id, {
            include: [
                {
                    model: User,
                    as: 'user1',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'profile_picture']
                },
                {
                    model: User,
                    as: 'user2',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'profile_picture']
                }
            ]
        });

        const otherUser = fullConversation.user1Id === userId ? 
            fullConversation.user2 : fullConversation.user1;

        res.json({
            id: fullConversation.id,
            otherUser,
            lastMessageAt: fullConversation.lastMessageAt,
            createdAt: fullConversation.createdAt
        });
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: 'Failed to create conversation' });
    }
};

// Get messages for a conversation
const getConversationMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { conversationId } = req.params;

        // Verify user is part of this conversation
        const conversation = await Conversation.findOne({
            where: {
                id: conversationId,
                [Op.or]: [
                    { user1Id: userId },
                    { user2Id: userId }
                ]
            }
        });

        if (!conversation) {
            return res.status(403).json({ error: 'Not authorized to view this conversation' });
        }

        const messages = await Message.findAll({
            where: { conversationId },
            include: [{
                model: User,
                as: 'sender',
                attributes: ['id', 'first_name', 'last_name', 'profile_picture']
            }],
            order: [['createdAt', 'ASC']]
        });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

module.exports = {
    getUserConversations,
    getOrCreateConversation,
    getConversationMessages
};
