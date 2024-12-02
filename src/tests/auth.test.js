const request = require('supertest');
const app = require('../app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Authentication', () => {
  beforeEach(async () => {
    // Clear the users table before each test
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Disconnect Prisma after all tests are run
    await prisma.$disconnect();
  });

  it('should register a user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.user).toBeDefined();
  });

  it('should login a user and return a token', async () => {
    // First, register the user
    await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

    // Then, login the user
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
