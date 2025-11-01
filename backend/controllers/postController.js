const { Post, User, Team } = require('../models/index');

const Controller = {
    createPost: async (req, res) => {
        try {
            const { user_id, content, image, team_id, visibility } = req.body;
            
            console.log('Creating post with data:', { user_id, content, image, team_id, visibility });

            // If visibility is 'team', set team_id. If 'all', team_id is null
            const postTeamId = visibility === 'team' ? team_id : null;

            console.log('Post team_id will be:', postTeamId);

            const newPost = await Post.create({
                user_id,
                content,
                image,
                team_id: postTeamId
            });

            console.log('Post created:', newPost.id);

            // Fetch the post with author info
            const postWithDetails = await Post.findByPk(newPost.id, {
                include: [
                    {
                        model: User,
                        as: 'author',
                        attributes: ['id', 'first_name', 'last_name', 'username', 'profile_picture']
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
                    [require('sequelize').Op.or]: [
                        { team_id: team_id },
                        { team_id: null }  // Include public posts
                    ]
                };
            }

            const posts = await Post.findAll({
                where: whereClause,
                include: [
                    {
                        model: User,
                        as: 'author',
                        attributes: ['id', 'first_name', 'last_name', 'username', 'profile_picture']
                    }
                ],
                order: [['createdAt', 'DESC']]
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
                include: [
                    {
                        model: User,
                        as: 'author',
                        attributes: ['id', 'first_name', 'last_name', 'username', 'profile_picture']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            res.status(200).json(posts);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = Controller;