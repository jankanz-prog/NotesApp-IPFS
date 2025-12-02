import { Router } from 'express';
import {
  createTransaction,
  getTransactionHistory,
  updateTransactionStatus,
  lookupWallet,
} from '../controllers/transactions.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.post('/', createTransaction);
router.get('/history', getTransactionHistory);
router.patch('/status', updateTransactionStatus);
router.get('/lookup/:walletAddress', lookupWallet);

export default router;
