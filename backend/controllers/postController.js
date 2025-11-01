const Post = require('../models/postModel');

const Controller = {
    createPost: async (req, res) => {
        try{
            const {user_id, content, image} = req.body;

            const newPost = await Post.create({user_id, content, image});
            res.status(200).json(newPost);
        } catch(err) {
            res.status(500).json({error: err.message});
        }
    },

    getAllPosts: async (req, res) => {
        try {
            const posts = Post.findAll();

            if(!posts)
                return res.status(400).send("No posts found");

            res.status(200).json(posts);
        } catch(err) {
            res.status(500).json({error: err.message});
        }
    }
};

module.exports = Controller