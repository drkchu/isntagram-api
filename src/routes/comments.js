const express = require('express');
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

const {
    getCommentsByPost,
    addComment,
    updateComment,
    deleteComment,
  } = require("../controllers/commentController");
  
  const router = express.Router();

router.get('/:postId', authMiddleware, getCommentsByPost); // Get comments for a specific post (Public)
router.post('/:postId', authMiddleware, addComment); // Add a new comment (Authenticated users)
router.patch('/:commentId', authMiddleware, updateComment); // Update a comment (Authenticated users)
router.delete('/:commentId', authMiddleware, deleteComment); // Delete a comment (Authenticated users or Admin)

module.exports = router;
