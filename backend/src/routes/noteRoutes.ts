import express from "express";
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getTags,
} from "../controllers/noteController";
import { protect } from "../middleware/authMiddleware";

/**
 * Note Routes — CRUD operations for user markdown notes.
 */
const router = express.Router();

// Protect all note routes (must be logged in)
router.use(protect);

// List all notes
router.get("/", getNotes);

// Get all unique tags
router.get("/tags", getTags);

// Get single note by ID
router.get("/:id", getNoteById);

// Create a new note
router.post("/", createNote);

// Update a note
router.put("/:id", updateNote);

// Delete a note
router.delete("/:id", deleteNote);

export default router;
