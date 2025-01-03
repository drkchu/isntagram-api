const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const userRoutes = require("./routes/users");
const commentRoutes = require("./routes/comments");
const chatRoutes = require("./routes/chats");
const cors = require("cors");

require('./middleware/passport');

dotenv.config();

const app = express();

const { Server } = require('socket.io');
const http = require('http');
const server = http.createServer(app); // Create an HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001", // THE FRONTEND URL
    methods: ["GET", "POST"],
  },
});

app.set('socketio', io);

app.use(express.json());

app.use(cors());

app.use("/posts", postRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/comments", commentRoutes);
app.use("/chats", chatRoutes);

// Web socket stuff
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join a conversation room
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the server only when this file is executed directly, for testing purposes
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
