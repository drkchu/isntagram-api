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
      callbackURL: 'http://localhost:3000/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create the user in your database
        const { id, username, emails } = profile;

        // Use the first email if it exists, otherwise null
        const email = emails && emails.length > 0 ? emails[0].value : null;

        let user = await prisma.user.findUnique({
          where: { githubId: id },
        });

        if (!user) {
          // If user does not exist, create a new one
          user = await prisma.user.create({
            data: {
              username: username || `github_user_${id}`,
              email: email,
              githubId: id,
            },
          });
        }

        // Return the user object
        done(null, user);
      } catch (error) {
        done(error, null);
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
