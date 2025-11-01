const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) return next();
    return res.status(401).json({ error: 'Not authenticated' });
};

router.get('/post/:postId', commentController.getCommentsForPost);
router.post('/', isAuthenticated, commentController.createComment);

module.exports = router;


