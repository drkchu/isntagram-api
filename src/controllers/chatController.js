const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getConversations = async (req, res) => {
  const userId = req.userId;

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true } },
          },
        },
        messages: {
          take: 1, // Fetch the latest message
          orderBy: { createdAt: "desc" },
        },
      },
    });

    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations." });
  }
};

exports.createConversation = async (req, res) => {
  const { isGroup, name, participants } = req.body;
  const userId = req.userId;

  if (!isGroup && participants.length !== 1) {
    return res
      .status(400)
      .json({ error: "Direct messages require exactly one participant." });
  }

  try {

    const participantIds = new Set(participants);
    participantIds.add(userId); // Add the creator

    const conversation = await prisma.conversation.create({
      data: {
        isGroup,
        name: isGroup ? name : null,
        creatorId: userId,
        participants: {
          create: Array.from(participantIds).map((participantId) => ({
            userId: participantId,
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true } },
          },
        },
        messages: {
          take: 1, // Fetch the latest message
          orderBy: { createdAt: "desc" },
        },
      },
    });

    res.status(201).json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation." });
  }
};

exports.getConversationById = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.userId;

  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: chatId,
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true } }, // Include participant details
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: { select: { id: true, username: true } }, // Include sender details
          },
        },
      },
    });

    if (!conversation) {
      return res
        .status(404)
        .json({ error: "Conversation not found or access denied." });
    }

    res.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Failed to fetch conversation." });
  }
};

exports.deleteConversation = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.userId;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: chatId },
      include: { participants: true },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    // Allow deletion if the user is the creator or a participant
    const isParticipant = conversation.participants.some(
      (participant) => participant.userId === userId
    );

    if (!isParticipant && !req.isAdmin) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this conversation." });
    }

    await prisma.conversation.delete({ where: { id: chatId } });

    res.json({ message: "Conversation deleted successfully." });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ error: "Failed to delete conversation." });
  }
};

exports.getMessagesByConversation = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: { conversationId: chatId },
      include: { sender: { select: { id: true, username: true } } },
      orderBy: { createdAt: "asc" }, // oldest first
    });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages." });
  }
};

exports.sendMessage = async (req, res) => {
  const { chatId } = req.params;
  const { content } = req.body;
  const userId = req.userId;

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Message content cannot be empty." });
  }

  try {
    const message = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        conversationId: chatId,
      },
      include: { sender: { select: { id: true, username: true }}},
    });

    // Notify participants via WebSocket, they gotta be listening in to what's happening
    const io = req.app.get("socketio");
    io.to(chatId).emit("newMessage", message);

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
};

exports.updateMessage = async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;
  const userId = req.userId;

  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.senderId !== userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to update this message." });
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { content },
    });

    res.json(updatedMessage);
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ error: "Failed to update message." });
  }
};

// Either the sender or an admin can delete a message
exports.deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.userId;

  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || (message.senderId !== userId && !req.isAdmin)) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this message." });
    }

    await prisma.message.delete({ where: { id: messageId } });

    res.json({ message: "Message deleted successfully." });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message." });
  }
};
