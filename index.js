const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const { authenticateToken } = require("./middleware/auth");
const http = require("http");
const socketIo = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://hilarious-boba-61404f.netlify.app",
    credentials: true,
  })
);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => {
    console.error("DB connection error: ", err);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", authenticateToken, adminRoutes);

// Socket.IO Configuration
const io = socketIo(server, {
  cors: {
    origin: "https://hilarious-boba-61404f.netlify.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("A new user has been connected");

  socket.on("updateScore", (score) => {
    console.log("Score received: ", score);
    socket.broadcast.emit("liveScore", score);
  });

  socket.on("disconnect", () => {
    console.log("A user has disconnected");
  });
});

// Server Listener
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
