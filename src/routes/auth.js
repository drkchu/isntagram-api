const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

/*

Registration:
    - Grab the new user information from the request's body.
    - Check to see if the user exists, throw an error if already exists.
    - Store the information w/ a hashed password into the db.

Login:
    - Grab the login information from the request's body.
    - Validate the password using bcrypt.compare(hashedPassword, passwordAttempt)
    - If successful, create a JWT including the appropriate user's ID using the JWT_SECRET

*/

// Registration
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user
    const newUser = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRY });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
