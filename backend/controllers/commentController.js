const { Comment, User } = require('../models');

const Controller = {
    getCommentsForPost: async (req, res) => {
        try {
            const { postId } = req.params;
            const comments = await Comment.findAll({
                where: { postId },
                include: [{
                    model: User,
                    as: 'author',
                    attributes: ['id', 'first_name', 'last_name', 'username', 'profile_picture']
                }],
                order: [['createdAt', 'ASC']]
            });
            return res.json(comments);
        } catch (err) {
            console.error('Error fetching comments:', err);
            return res.status(500).json({ error: 'Failed to fetch comments' });
        }
    },

    createComment: async (req, res) => {
        try {
            if (!req.isAuthenticated || !req.isAuthenticated()) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
            const userId = req.user.id;
            const { postId, content } = req.body;
            if (!postId || !content || !content.trim()) {
                return res.status(400).json({ error: 'postId and content are required' });
            }
            const created = await Comment.create({ postId, userId, content: content.trim() });
            const full = await Comment.findByPk(created.id, {
                include: [{
                    model: User,
                    as: 'author',
                    attributes: ['id', 'first_name', 'last_name', 'username', 'profile_picture']
                }]
            });
            return res.status(201).json(full);
        } catch (err) {
            console.error('Error creating comment:', err);
            return res.status(500).json({ error: 'Failed to create comment' });
        }
    }
};

module.exports = Controller;


