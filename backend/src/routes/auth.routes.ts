import { Router } from 'express';
import { register, login, getProfile, updateProfilePicture } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.patch('/profile-picture', authMiddleware, updateProfilePicture, );

export default router;