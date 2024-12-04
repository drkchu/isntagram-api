const express = require('express');
const dotenv = require('dotenv');
const passport = require('./middleware/passport');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const authMiddleware = require('./middleware/authMiddleware');

dotenv.config();

const app = express();

app.use(express.json());

// Important routes
app.use('/posts', postRoutes);
app.use('/auth', authRoutes);

// Protected test Route
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