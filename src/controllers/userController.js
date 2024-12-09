const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Admin only
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        // Basically everything except their password
        id: true,
        username: true,
        email: true,
        isAdmin: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users." });
  }
};

// Public, just shares their profile information (fine since posts are the ones where visibility is important)
exports.getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) return res.status(404).json({ error: "User not found." });

    res.json({
      id: user.id,
      username: user.username,
      bio: user.profile?.bio,
      avatarUrl: user.profile?.avatarUrl,
      location: user.profile?.location,
      website: user.profile?.website,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user." });
  }
};

exports.getAuthenticatedUser = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) return res.status(404).json({ error: "User not found!!" });

    res.json(user);
  } catch (error) {
    console.error("Error fetching authenticated user:", error);
    res.status(500).json({ error: "Failed to fetch authenticated user." });
  }
};

// Public
exports.getUserFollowers = async (req, res) => {
  const { userId } = req.params;

  const userExists = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userExists) {
    return res.status(404).json({ error: "User not found." });
  }

  try {
    const followers = await prisma.follower.findMany({
      where: { followedId: userId },
      include: {
        follower: { select: { id: true, username: true, profile: true } },
      },
    });

    res.json(
      followers.map((f) => ({
        id: f.follower.id,
        username: f.follower.username,
        avatarUrl: f.follower.profile?.avatarUrl,
      }))
    );
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ error: "Failed to fetch followers." });
  }
};

// Public
exports.getUserFollowing = async (req, res) => {
  const { userId } = req.params;

  const userExists = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userExists) {
    return res.status(404).json({ error: "User not found." });
  }

  try {
    const following = await prisma.follower.findMany({
      where: { followerId: userId },
      include: {
        followed: { select: { id: true, username: true, profile: true } },
      },
    });

    res.json(
      following.map((f) => ({
        id: f.followed.id,
        username: f.followed.username,
        avatarUrl: f.followed.profile?.avatarUrl,
      }))
    );
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ error: "Failed to fetch following." });
  }
};

exports.updateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const { bio, avatarUrl, location, website } = req.body;

  if (req.userId !== userId) {
    return res
      .status(403)
      .json({ error: "You can only update your own profile." });
  }

  try {
    const profile = await prisma.profile.update({
      where: { userId },
      data: { bio, avatarUrl, location, website },
    });

    res.json(profile);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile." });
  }
};

exports.followUser = async (req, res) => {
  const followerId = req.userId;
  const { userId: followedId } = req.params;

  if (followerId === followedId) {
    return res.status(400).json({ error: "You cannot follow yourself." });
  }

  try {
    await prisma.follower.create({
      data: { followerId, followedId },
    });
    res.status(201).json({ message: "Successfully followed the user." });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ error: "Failed to follow user." });
  }
};

exports.unfollowUser = async (req, res) => {
  const followerId = req.userId;
  const { userId: followedId } = req.params;

  try {
    await prisma.follower.deleteMany({
      where: { followerId, followedId },
    });
    res.json({ message: "Successfully unfollowed the user." });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ error: "Failed to unfollow user." });
  }
};

exports.deleteUser = async (req, res) => {
  const { userId } = req.params;

  // Check if the requester is authorized
  if (req.userId !== userId && !req.isAdmin) {
    return res
      .status(403)
      .json({ error: "You are not authorized to delete this user." });
  }

  try {
    // Delete the user (since I'm using cascading deletes, all the associated relationships are handled, hopefully LOL)
    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user." });
  }
};

exports.searchUsers = async (req, res) => {

  if (!req.query.hasOwnProperty("username") && !(req.query.hasOwnProperty("email"))) {
    return res.status(400).json({ error: "Username or email query parameter is required." });
  }

  const { email, username } = req.query;

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: username, mode: "insensitive" } },
          { email: { contains: email, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        username: true,
        profile: {
          select: {
            avatarUrl: true,
          },
        },
      },
    });

    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Failed to search users." });
  }
};

exports.updateUserRole = async (req, res) => {
    const { userId } = req.params;
    const { isAdmin } = req.body;
  
    if (typeof isAdmin !== 'boolean') {
      return res.status(400).json({ error: 'isAdmin must be a boolean.' });
    }
  
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isAdmin },
      });
  
      res.json({
        message: `User role updated successfully.`,
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin,
        },
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ error: 'Failed to update user role.' });
    }
  };
  
