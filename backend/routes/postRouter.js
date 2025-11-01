const express = require('express');
const router = express.Router();
const postController = require("../controllers/index").postController;

router.post('/create-post', postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/team/:team_id', postController.getTeamPosts);
router.post('/upload-image', postController.uploadImage);
router.post('/:id/like', postController.likePost);

module.exports = router;