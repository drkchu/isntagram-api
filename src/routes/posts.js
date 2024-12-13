const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createPost,
  getPosts,
  getPostsFromFollowedUsers,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
} = require("../controllers/postController");

const router = express.Router();

router.post("/", authMiddleware, upload.single("image"), createPost); // Create a post with an image upload
router.get("/", authMiddleware, getPosts); // Get all posts
router.get("/following", authMiddleware, getPostsFromFollowedUsers)
router.get("/:id", authMiddleware, getPostById); // Get a specific post by ID if authorized
router.patch("/:id", authMiddleware, updatePost); // Update a post by ID
router.delete("/:id", authMiddleware, deletePost); // Delete a post
router.post("/:id/like", authMiddleware, likePost); // Like a post
router.delete("/:id/like", authMiddleware, unlikePost); // Unlike a post

module.exports = router;
