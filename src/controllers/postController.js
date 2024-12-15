const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Create a new post
 */
exports.createPost = async (req, res) => {
  const { content, privacy } = req.body;

  try {
    // Ensure an image file was uploaded, Multer does handles this stuff
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    // Get the S3 image URL from Multer
    const imageUrl = req.file.location; // `location` is populated by multer-s3

    // Create the post in the database
    const post = await prisma.post.create({
      data: {
        content,
        privacy,
        imageUrl, // Save the S3 image URL in the database
        userId: req.userId, // Authenticated user ID
      },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
};

/**
 * Get all posts for the authenticated user
 */
exports.getPosts = async (req, res) => {
  const userId = req.userId;

  try {
    // Fetch all posts for the logged-in user

    const posts = await prisma.post.findMany({
      where: { userId},
      include: {
        _count: {
          select: { likes: true }, // Include the like count
        },
        user: {
          select: { username: true }, // Include posts owners username
        },
      },
      orderBy: {
        createdAt: "desc", // Order by createdAt in descending order (most recent first)
      },
    });

    const postIds = posts.map((post) => post.id);

    const likedPosts = await prisma.like.findMany({
      where: {
        postId: { in: postIds },
        userId,
      },
      select: { postId: true },
    });

    // Create a set of post IDs that the user liked
    const likedPostIds = new Set(likedPosts.map((like) => like.postId));

    const postsWithLikeStatus = posts.map((post) => ({
      ...post,
      isLiked: likedPostIds.has(post.id),
    }));

    res.json(postsWithLikeStatus);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

/**
 * Get a single post by ID
 *
 * Criteria: The authenticated user is the owner of the post ||
 *           The authenticated user follows the owner of the post, and the post has PRIVATE privacy ||
 *           The post is public
 */

exports.getPostById = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    // Fetch the post and its creator
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: { username: true }, // Include posts owners username
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if the authenticated user has liked the post
    const likeRecord = await prisma.like.findFirst({
      where: {
        postId: id,
        userId,
      },
    });

    const isLiked = Boolean(likeRecord);

    // Check privacy rules
    const isPostOwner = post.user.id === userId;
    const isPublic = post.privacy === "PUBLIC";

    let isFollowing = false;
    if (post.privacy === "PRIVATE") {
      const followRecord = await prisma.follower.findFirst({
        where: {
          followerId: userId,
          followedId: post.user.id, // If followRecord exists, then the userId follows the posts owner
        },
      });
      isFollowing = Boolean(followRecord);
    }

    if (!(isPostOwner || isPublic || isFollowing || req.isAdmin)) {
      if (post.privacy === "PRIVATE") {
        return res.status(403).json({
          error: "This post is private. You must follow the user to view it.",
        });
      } else {
        return res
          .status(403)
          .json({ error: "You are not authorized to access this post." });
      }
    }

    res.json({ ...post, isLiked });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
};

exports.getPostsFromFollowedUsers = async (req, res) => {
  const { limit = 10 } = req.query; // Default limit is 10
  const userId = req.userId;

  try {
    // Get the IDs of users the current user is following
    const followedUsers = await prisma.follower.findMany({
      where: { followerId: userId },
      select: { followedId: true },
    });

    const followedUserIds = followedUsers.map((user) => user.followedId);

    // Fetch posts from followed users, ordered by creation date
    const posts = await prisma.post.findMany({
      where: {
        userId: { in: followedUserIds },
      },
      include: {
        _count: {
          select: { likes: true }, // Include the like count
        },
        user: {
          select: { username: true }, // Include the username of the post owner
        },
      },
      orderBy: { createdAt: "desc" }, // Reverse chronological order
      take: parseInt(limit, 10), // Limit the number of posts returned
    });

    // Fetch like status for each post
    const postIds = posts.map((post) => post.id);
    const likedPosts = await prisma.like.findMany({
      where: {
        postId: { in: postIds },
        userId,
      },
      select: { postId: true },
    });

    const likedPostIds = new Set(likedPosts.map((like) => like.postId));

    // Add `isLiked` to each post
    const postsWithLikeStatus = posts.map((post) => ({
      ...post,
      isLiked: likedPostIds.has(post.id),
    }));

    res.json(postsWithLikeStatus);
  } catch (error) {
    console.error("Error fetching posts from followed users:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

/**
 * Update a post
 */
exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const { content, privacy } = req.body;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post || post.userId !== req.userId) {
      return res.status(404).json({ error: "Post not found or unauthorized" });
    }

    // Update the post with provided fields
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...(content && { content }),
        ...(privacy && { privacy }),
      },
    });

    res.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
};

/**
 * Delete a post
 * TODO: Once a post is deleted, delete the corresponding file stored in AWS S3
 */
exports.deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post || post.userId !== req.userId) {
      return res.status(404).json({ error: "Post not found or unauthorized" });
    }

    // Delete the post
    await prisma.post.delete({
      where: { id },
    });

    res.status(204).send(); // No content
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
};

exports.likePost = async (req, res) => {
  const { id } = req.params; // Post ID
  const userId = req.userId; // Authenticated User ID

  try {
    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if the user has already liked the post
    const existingLike = await prisma.like.findFirst({
      where: {
        postId: id,
        userId,
      },
    });

    if (existingLike) {
      return res
        .status(400)
        .json({ error: "You have already liked this post" });
    }

    // Add a like to the post
    const like = await prisma.like.create({
      data: {
        postId: id,
        userId,
      },
    });

    res.status(201).json(like);
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ error: "Failed to like post" });
  }
};

exports.unlikePost = async (req, res) => {
  const { id } = req.params; // Post ID
  const userId = req.userId; // Authenticated User ID

  try {
    // Check if the like exists
    const existingLike = await prisma.like.findFirst({
      where: {
        postId: id,
        userId,
      },
    });

    if (!existingLike) {
      return res.status(404).json({ error: "You have not liked this post" });
    }

    // Remove the like
    await prisma.like.delete({
      where: { id: existingLike.id },
    });

    res.status(204).send(); // No content
  } catch (error) {
    console.error("Error unliking post:", error);
    res.status(500).json({ error: "Failed to unlike post" });
  }
};
