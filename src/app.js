const express = require('express');
const dotenv = require('dotenv');
const passport = require('./middleware/passport');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const authMiddleware = require('./middleware/authMiddleware');

dotenv.config();

const app = express();

app.use(express.json());

app.use('/posts', postRoutes);
app.use('/auth', authRoutes);
// app.use('/users', userRoutes);

// Start the server only when this file is executed directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;