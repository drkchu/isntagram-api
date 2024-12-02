const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

app.use(express.json());

// Public Routes
app.use('/auth', authRoutes);

// Protected Test Route
app.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route', userId: req.userId });
});

// Start the server only when this file is executed directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;