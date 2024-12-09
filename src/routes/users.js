const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  getAllUsers,
  getUserById,
  getAuthenticatedUser,
  getUserFollowers,
  getUserFollowing,
  updateUserProfile,
  deleteUser,
  followUser,
  unfollowUser,
  searchUsers,
  updateUserRole,
} = require("../controllers/userController");

const router = express.Router();

router.get("/", authMiddleware, adminMiddleware, getAllUsers); // Admin-only
router.get("/self", authMiddleware, getAuthenticatedUser); // Authenticated users only
router.get("/search", searchUsers); // Public
router.get("/:userId", getUserById); // Public
router.get("/:userId/followers", getUserFollowers); // Public
router.get("/:userId/following", getUserFollowing); // Public
router.patch("/:userId/profile", authMiddleware, updateUserProfile); // Authenticated users only
router.delete("/:userId", authMiddleware, deleteUser); // Self-delete or Admin-only
router.post("/:userId/follow", authMiddleware, followUser); // Authenticated users only
router.post("/:userId/unfollow", authMiddleware, unfollowUser); // Authenticated users only
router.patch("/:userId/role", authMiddleware, adminMiddleware, updateUserRole); // Admin-only

module.exports = router;
