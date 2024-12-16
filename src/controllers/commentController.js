const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getCommentsByPost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.userId; // Authenticated user's ID

  try {
    // Fetch the post and its creator
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: { select: { id: true } },
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check privacy rules
    const isPostOwner = post.user.id === userId;
    const isPublic = post.privacy === "PUBLIC";

    let isFollowing = false;
    if (post.privacy === "PRIVATE") {
      const followRecord = await prisma.follower.findFirst({
        where: {
          followerId: userId,
          followedId: post.user.id, // Check if the authenticated user follows the post's owner
        },
      });
      isFollowing = Boolean(followRecord);
    }

    if (!(isPostOwner || isPublic || isFollowing || req.isAdmin)) {
      if (post.privacy === "PRIVATE") {
        return res.status(403).json({
          error:
            "This post is private. You must follow the user to view its comments.",
        });
      } else {
        return res.status(403).json({
          error: "You are not authorized to access this post's comments.",
        });
      }
    }

    // Fetch comments for the post
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: { id: true, username: true },
        },
      },
      orderBy: { createdAt: "asc" }, // Oldest comments first
    });

    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

// Requires authentication, optional parent comment
exports.addComment = async (req, res) => {
  const { postId } = req.params;
  const { content, parentId } = req.body;
  const userId = req.userId; // Authenticated user's ID

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Content is required." });
  }

  try {
    // Fetch the post to validate access
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { user: { select: { id: true } } }, // Include the post's owner
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    // Check privacy rules
    const isPostOwner = post.user.id === userId;
    const isPublic = post.privacy === "PUBLIC";

    let isFollowing = false;
    if (post.privacy === "PRIVATE") {
      const followRecord = await prisma.follower.findFirst({
        where: {
          followerId: userId,
          followedId: post.user.id,
        },
      });
      isFollowing = Boolean(followRecord);
    }

    if (!(isPostOwner || isPublic || isFollowing)) {
      if (post.privacy === "PRIVATE") {
        return res.status(403).json({
          error:
            "This post is private. You must follow the user to comment on it.",
        });
      } else {
        return res
          .status(403)
          .json({ error: "You are not authorized to comment on this post." });
      }
    }

    // Validate the parentId, if provided
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment || parentComment.postId !== postId) {
        return res.status(400).json({ error: "Invalid parent comment." });
      }
    }

    // Create the comment
    const newComment = await prisma.comment.create({
      data: {
        content,
        userId, // Authenticated user's ID
        postId,
        parentId: parentId || null, // Set parentId if it's a reply
      },
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment." });
  }
};

// Edit the comment, authentication
exports.updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Content is required." });
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found." });
    }

    if (comment.userId !== req.userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to update this comment." });
    }

    if (comment.post.privacy === 'RESTRICTED') {
        return res.status(403).json({ error: 'You cannot update a comment on a restricted post.' });
      }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });

    res.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ error: "Failed to update comment." });
  }
};

// Authenticated owner or admin
exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found." });
    }

    // Allow only the author or an admin to delete the comment
    if (comment.userId !== req.userId && !req.isAdmin) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this comment." });
    }

    await prisma.comment.delete({ where: { id: commentId } });

    res.json({ message: "Comment deleted successfully." });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment." });
  }
};
