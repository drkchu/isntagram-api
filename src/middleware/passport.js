const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists
        let user = await prisma.user.findUnique({
          where: { githubId: profile.id },
        });

        if (!user) {
          // Start a transaction to create user and profile together
          user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
              data: {
                githubId: profile.id,
                username: profile.username,
                email: profile.emails[0].value, // GitHub email
              },
            });

            // Create the profile linked to the new user
            await tx.profile.create({
              data: {
                userId: newUser.id,
                avatarUrl: profile.photos[0].value, // GitHub profile picture
              },
            });

            return newUser;
          });
        }

        // Pass the user to the callback
        return done(null, user);
      } catch (error) {
        console.error('Error in GitHub strategy:', error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user); // Attach the user to req.user
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;