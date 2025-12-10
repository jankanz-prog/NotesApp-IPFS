import { Router } from 'express';
import { register, login, forgotPassword, resetPassword, getProfile, updateProfile, updateProfilePicture, linkWallet, unlinkWallet } from '../controllers/auth.controller';
import { googleLogin } from '../controllers/oauth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google', googleLogin);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.patch('/profile-picture', authMiddleware, updateProfilePicture);
router.post('/wallet/link', authMiddleware, linkWallet);
router.delete('/wallet/unlink', authMiddleware, unlinkWallet);

export default router;