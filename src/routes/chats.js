const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  getConversations,
  createConversation,
  getConversationById,
  deleteConversation,
  getMessagesByConversation,
  sendMessage,
  updateMessage,
  deleteMessage,
} = require("../controllers/chatController");

const router = express.Router();

// Conversation routes
router.get("/", authMiddleware, getConversations); // Fetch all conversations for the user
router.post("/", authMiddleware, createConversation); // Create a new conversation
router.get("/:chatId", authMiddleware, getConversationById); // Get details of a specific conversation
router.delete("/:chatId", authMiddleware, deleteConversation); // Delete a conversation

// Message routes
router.get("/:chatId/messages", authMiddleware, getMessagesByConversation); // Fetch all messages in a conversation
router.post("/:chatId/messages", authMiddleware, sendMessage); // Send a new message
router.patch("/messages/:messageId", authMiddleware, updateMessage); // Update a message
router.delete("/messages/:messageId", authMiddleware, deleteMessage); // Delete a message

module.exports = router;
