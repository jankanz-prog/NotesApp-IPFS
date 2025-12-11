import { Router } from 'express';
import { register, login, forgotPassword, resetPassword, getProfile, updateProfile, updateProfilePicture, uploadProfilePicture, linkWallet, unlinkWallet } from '../controllers/auth.controller';
import { googleLogin } from '../controllers/oauth.controller';
import { authMiddleware } from '../middleware/auth';
import { uploadProfilePicture as uploadMiddleware } from '../middleware/upload.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google', googleLogin);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.patch('/profile-picture', authMiddleware, updateProfilePicture);
router.post('/profile-picture/upload', authMiddleware, uploadMiddleware.single('profilePicture'), uploadProfilePicture);
router.post('/wallet/link', authMiddleware, linkWallet);
router.delete('/wallet/unlink', authMiddleware, unlinkWallet);

export default router;