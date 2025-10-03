import { z } from "zod";
import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import Note from "../models/Note";

// Zod validation schema for notes
const noteSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  pinned: z.boolean().optional(),
});
const INVALID_NOTE_MSG = "Invalid note data";

/** Helper to count words in note content */
const wordCount = (text: string): number =>
  text.trim().split(/\s+/).filter(Boolean).length;

/** Get all notes for the user */
export const getNotes = async (req: AuthRequest, res: Response) => {
  try {
    const notes = await Note.find({ userId: req.userId }).sort({
      pinned: -1,
      updatedAt: -1,
    });
    res.json({ success: true, notes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** Get one note by its ID */
export const getNoteById = async (req: AuthRequest, res: Response) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!note)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, note });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** Create a new note */
export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = noteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: INVALID_NOTE_MSG,
        errors: parsed.error.issues,
      });
    }
    const { title, content = "", tags = [], pinned = false } = parsed.data;
    const note = await Note.create({
      userId: req.userId,
      title,
      content,
      tags,
      pinned,
      wordCount: wordCount(content),
    });
    res.status(201).json({ success: true, note });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** Update a note */
export const updateNote = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = noteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: INVALID_NOTE_MSG,
        errors: parsed.error.issues,
      });
    }
    const { title, content = "", tags = [], pinned } = parsed.data;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, content, tags, pinned, wordCount: wordCount(content) },
      { new: true }
    );
    if (!note)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, note });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** Delete a note */
export const deleteNote = async (req: AuthRequest, res: Response) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!note)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Note deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** Get all unique tags for notes of the user */
export const getTags = async (req: AuthRequest, res: Response) => {
  try {
    const notes = await Note.find({ userId: req.userId });
    const tagsSet = new Set<string>();
    notes.forEach((note) =>
      note.tags.forEach((tag) => tagsSet.add(tag))
    );
    res.json({ success: true, tags: Array.from(tagsSet) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
