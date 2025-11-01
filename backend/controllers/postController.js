const Post = require('../models/postModel');

const Controller = {
    createPost: async (req, res) => {
        try{
            const {user_id, content, image, visibility} = req.body;
            console.log('POST /api/post/create-post', { user_id, hasImage: !!image, visibility });

            // visibility is either a team ID string or null
            const normalizedVisibility = typeof visibility === 'string' && visibility.trim().length > 0
                ? visibility.trim()
                : null;

            const newPost = await Post.create({user_id, content, image, visibility: normalizedVisibility});
            res.status(200).json(newPost);
        } catch(err) {
            res.status(500).json({error: err.message});
        }
    },

    getAllPosts: async (req, res) => {
        try {
            const posts = await Post.findAll({
                order: [['createdAt', 'DESC']]
            });

            if(!posts)
                return res.status(400).send("No posts found");

            res.status(200).json(posts);
        } catch(err) {
            res.status(500).json({error: err.message});
        }
    }
};

module.exports = Controller;