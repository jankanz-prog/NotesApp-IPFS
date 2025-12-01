import { Router } from 'express';
import { getFolders, createFolder, updateFolder, deleteFolder, getFolderNotes } from '../controllers/folders.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.get('/', authMiddleware, getFolders);
router.post('/', authMiddleware, createFolder);
router.put('/:id', authMiddleware, updateFolder);
router.delete('/:id', authMiddleware, deleteFolder);
router.get('/:id/notes', authMiddleware, getFolderNotes);

export default router;
