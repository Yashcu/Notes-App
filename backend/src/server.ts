import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import noteRoutes from "./routes/noteRoutes";

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.get("/api/health", (_req, res) => res.json({ status: "OK" }));

// Socket.io server for real-time notes
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  // Join a note editing room
  socket.on("join_note", ({ noteId, user }) => {
    socket.join(noteId);
    socket.to(noteId).emit("user_joined", { user });
  });

  // Listen for edits and broadcast to all in room except sender
  socket.on("edit_note", (data) => {
    const { noteId, content, cursor, user } = data;
    socket.to(noteId).emit("note_edited", { content, cursor, user });
  });

  // Broadcast cursor movement
  socket.on("cursor_move", (data) => {
    const { noteId, cursor, user } = data;
    socket.to(noteId).emit("cursor_moved", { cursor, user });
  });

  socket.on("disconnecting", () => {
    const rooms = Array.from(socket.rooms);
    rooms.forEach((room) => {
      socket.to(room).emit("user_left", { user: socket.id });
    });
  });
});

// Port/DB setup
const PORT = process.env.PORT || 5000;

// Connect DB and start server
connectDB()
  .then(() => {
    httpServer.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });

// Export app for testing if needed
export default app;
