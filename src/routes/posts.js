const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
} = require('../controllers/postController');

const router = express.Router();

// Create a post with an image upload
router.post('/', authMiddleware, upload.single('image'), createPost);

// Get all posts
router.get('/', authMiddleware, getPosts);

// Get a specific post by ID
router.get('/:id', authMiddleware, getPostById);

// Update a post by ID, using Patch since we might only change a piece of a post, not the entire things
router.patch('/:id', authMiddleware, updatePost);

// Delete a post
router.delete('/:id', authMiddleware, deletePost);

module.exports = router;
