import express from 'express';
import { getNotes, getNoteById, createNote, updateNote, deleteNote, getTags } from '../controllers/noteController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();
router.use(protect);

router.get('/', getNotes);
router.get('/tags', getTags);
router.get('/:id', getNoteById);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
