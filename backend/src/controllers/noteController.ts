import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Note from '../models/Note';

// All notes for user
export const getNotes = async (req: AuthRequest, res: Response) => {
  const notes = await Note.find({ userId: req.userId }).sort({ pinned: -1, updatedAt: -1 });
  res.json({ notes });
};

// One note by id
export const getNoteById = async (req: AuthRequest, res: Response) => {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId});
    if(!note) return res.status(404).json({ message: 'Not found'});
    res.json({ note });
};

// Create note
export const createNote = async (req: AuthRequest, res: Response) => {
  const { title, content, tags } = req.body;
  const note = await Note.create({ userId: req.userId, title, content, tags });
  res.status(201).json({ note });
}

// Update Note
export const updateNote = async (req: AuthRequest, res: Response) => {
  const { title, content, tags, pinned } = req.body;
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { title, content, tags, pinned },
    { new: true }
  );
  if (!note) return res.status(404).json({ message: 'Not found' });
  res.json({ note });
};

// Delete Note
export const deleteNote = async (req: AuthRequest, res: Response) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!note) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Note deleted' });
};

// Get tags
export const getTags = async (req: AuthRequest, res: Response) => {
  const notes = await Note.find({ userId: req.userId });
  const tagsSet = new Set<string>();
  notes.forEach(note => note.tags.forEach(tag => tagsSet.add(tag)));
  res.json({ tags: Array.from(tagsSet) });
};
