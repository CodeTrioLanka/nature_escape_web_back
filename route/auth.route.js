import { Router } from 'express';
import { register, login, logout, me, changePassword } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', me);
router.post('/change-password', verifyToken, changePassword);

export default router;
