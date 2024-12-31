const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createPost,
  getPosts,
  getPostsByUser,
  getPostsFromFollowedUsers,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
} = require("../controllers/postController");

const router = express.Router();

router.post("/", authMiddleware, upload.single("image"), createPost); // Create a post with an image upload
router.get("/", authMiddleware, getPosts); // Get all posts from the authenticated user
router.get("/user/:userId", authMiddleware, getPostsByUser); // Get all posts from a specific user that the authenticated user is allowed to see
router.get("/following", authMiddleware, getPostsFromFollowedUsers)
router.get("/:id", authMiddleware, getPostById); // Get a specific post by ID if authorized
router.patch("/:id", authMiddleware, updatePost); // Update a post by ID
router.delete("/:id", authMiddleware, deletePost); // Delete a post
router.post("/:id/like", authMiddleware, likePost); // Like a post
router.delete("/:id/like", authMiddleware, unlikePost); // Unlike a post

module.exports = router;
