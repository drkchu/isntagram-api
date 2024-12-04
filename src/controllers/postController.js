const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create a new post
 */
exports.createPost = async (req, res) => {
  const { content, privacy } = req.body;

  try {
    // Ensure an image file was uploaded, Multer does handles this stuff
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
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
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

/**
 * Get all posts for the authenticated user
 */
exports.getPosts = async (req, res) => {
  try {
    // Fetch all posts for the logged-in user
    const posts = await prisma.post.findMany({
      where: { userId: req.userId },
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

/**
 * Get a single post by ID
 */
exports.getPostById = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the post by ID
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post || post.userId !== req.userId) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
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
      return res.status(404).json({ error: 'Post not found or unauthorized' });
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
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
};

/**
 * Delete a post
 */
exports.deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post || post.userId !== req.userId) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    // Delete the post
    await prisma.post.delete({
      where: { id },
    });

    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};
