const { Post, User, Team, PostLike, Comment } = require('../models/index');
const { Op, fn, col } = require('sequelize');
const fs = require('fs');
const path = require('path');

const Controller = {
    uploadImage: async (req, res) => {
        try {
            const { dataUrl, fileName } = req.body;
            if (!dataUrl || typeof dataUrl !== 'string') {
                return res.status(400).json({ error: 'dataUrl is required' });
            }

            const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
            if (!match) {
                return res.status(400).json({ error: 'Invalid data URL' });
            }
            const mime = match[1];
            const base64 = match[2];
            const buffer = Buffer.from(base64, 'base64');

            let ext = '.bin';
            if (mime === 'image/png') ext = '.png';
            else if (mime === 'image/jpeg' || mime === 'image/jpg') ext = '.jpg';
            else if (mime === 'image/gif') ext = '.gif';

            const safeName = (fileName || 'upload').replace(/[^a-zA-Z0-9-_]/g, '');
            const fileBase = `${Date.now()}-${safeName}${ext}`;
            const filePath = path.join(__dirname, '..', 'uploads', fileBase);
            fs.writeFileSync(filePath, buffer);

            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const url = `${baseUrl}/uploads/${fileBase}`;
            return res.status(201).json({ url, file: `/uploads/${fileBase}` });
        } catch (err) {
            console.error('uploadImage error:', err);
            return res.status(500).json({ error: 'Failed to upload image' });
        }
    },
    createPost: async (req, res) => {
        try {
            const { user_id, content, image, team_id, visibility, urgent, help } = req.body;
            
            console.log('Creating post with data:', { user_id, content, image, team_id, visibility, urgent, help });

            // If visibility is 'team', set team_id. If 'all', team_id is null
            const postTeamId = visibility === 'team' ? team_id : null;

            console.log('Post team_id will be:', postTeamId);

            const newPost = await Post.create({
                user_id,
                content,
                image,
                team_id: postTeamId,
                urgent: !!urgent,
                help: !!help
            });

            console.log('Post created:', newPost.id);

            // Increment user experience (e.g., +10 XP per post)
            try {
                const XP_PER_POST = 10;
                await User.increment('experience', { by: XP_PER_POST, where: { id: user_id } });
            } catch (incErr) {
                console.error('Failed to increment user experience:', incErr);
            }

            // Fetch the post with author info
            const postWithDetails = await Post.findByPk(newPost.id, {
                include: [
                    {
                        model: User,
                        as: 'author',
                        attributes: ['id', 'first_name', 'last_name', 'username', 'profile_picture', 'experience']
                    }
                ]
            });

            res.status(201).json(postWithDetails);
        } catch (err) {
            console.error('Error creating post:', err);
            res.status(500).json({ error: err.message });
        }
    },

    getAllPosts: async (req, res) => {
        try {
            const { team_id, user_id } = req.query;

            let whereClause = {};

            // If team_id provided, get posts for that team OR public posts
            if (team_id) {
                whereClause = {
                    [Op.or]: [
                        { team_id: team_id },
                        { team_id: null }  // Include public posts
                    ]
                };
            }

            const posts = await Post.findAll({
                where: whereClause,
                attributes: {
                    include: [[fn('COUNT', col('comments.id')), 'commentsCount']]
                },
                include: [
                    {
                        model: User,
                        as: 'author',
                        attributes: ['id', 'first_name', 'last_name', 'username', 'profile_picture', 'experience']
                    },
                    {
                        model: Comment,
                        as: 'comments',
                        attributes: [],
                        required: false
                    }
                ],
                group: ['posts.id', 'author.id'],
                order: [['urgent', 'DESC'], ['help', 'DESC'], ['createdAt', 'DESC']]
            });

            if (!posts || posts.length === 0) {
                return res.status(200).json([]);
            }

            res.status(200).json(posts);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getTeamPosts: async (req, res) => {
        try {
            const { team_id } = req.params;

            const posts = await Post.findAll({
                where: { team_id },
                attributes: {
                    include: [[fn('COUNT', col('comments.id')), 'commentsCount']]
                },
                include: [
                    {
                        model: User,
                        as: 'author',
                        attributes: ['id', 'first_name', 'last_name', 'username', 'profile_picture', 'experience']
                    },
                    {
                        model: Comment,
                        as: 'comments',
                        attributes: [],
                        required: false
                    }
                ],
                group: ['posts.id', 'author.id'],
                order: [[ 'urgent', 'DESC' ], ['help', 'DESC'], ['createdAt', 'DESC']]
            });

            res.status(200).json(posts);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    likePost: async (req, res) => {
        try {
            const { id } = req.params;
            if (!req.isAuthenticated || !req.isAuthenticated()) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
            const userId = req.user.id;

            const post = await Post.findByPk(id);
            if (!post) return res.status(404).json({ error: 'Post not found' });

            // toggle like
            const existing = await PostLike.findOne({ where: { postId: id, userId } });
            if (existing) {
                await existing.destroy();
                if ((post.likes || 0) > 0) {
                    await post.decrement('likes', { by: 1 });
                }
                await post.reload();
                return res.status(200).json({ id: post.id, likes: post.likes, liked: false });
            } else {
                await PostLike.create({ postId: id, userId });
                await post.increment('likes', { by: 1 });
                await post.reload();
                return res.status(200).json({ id: post.id, likes: post.likes, liked: true });
            }
        } catch (err) {
            console.error('Error liking post:', err);
            return res.status(500).json({ error: 'Failed to like post' });
        }
    },

    deletePost: async (req, res) => {
        try {
            const { id } = req.params;
            if (!req.isAuthenticated || !req.isAuthenticated()) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
            const userId = req.user.id;

            const post = await Post.findByPk(id);
            if (!post) return res.status(404).json({ error: 'Post not found' });
            if (String(post.user_id) !== String(userId)) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            await post.destroy();
            return res.status(200).json({ ok: true, id });
        } catch (err) {
            console.error('Error deleting post:', err);
            return res.status(500).json({ error: 'Failed to delete post' });
        }
    }
};

module.exports = Controller;