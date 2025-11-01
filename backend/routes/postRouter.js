const express = require('express');
const router = express.Router();
const postController = require("../controllers/index").postController;

router.post('/create-post', postController.createPost);
router.get('/', postController.getAllPosts);

module.exports = router;