const request = require('supertest');
const app = require('../app'); // Import the app instance
const nock = require('nock'); // For mocking external API calls
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('GitHub Authentication', () => {
  beforeEach(async () => {
    // Clear the users table before each test
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Disconnect Prisma after all tests are done
    await prisma.$disconnect();
  });

  it('should authenticate a user with GitHub and return a JWT', async () => {
    // Mock GitHub's OAuth token endpoint
    nock('https://github.com')
      .post('/login/oauth/access_token')
      .reply(200, { access_token: process.env.GITHUB_CLIENT_SECRET });

    // Mock GitHub's user API endpoint
    nock('https://api.github.com')
      .get('/user')
      .reply(200, {
        id: 'mockGithubId',
        login: 'mockUser',
        email: 'mockuser@example.com',
      });

    // Simulate the callback from GitHub
    const res = await request(app)
      .get('/auth/github/callback')
      .query({ code: 'mockCode' }); // Simulate the authorization code from GitHub

    // Assertions
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();

    // Verify the user was created in the database
    const user = await prisma.user.findUnique({
      where: { githubId: 'mockGithubId' },
    });
    expect(user).toBeDefined();
    expect(user.email).toBe('mockuser@example.com');
  });
});
