import express from 'express';
import { body } from 'express-validator';
import { register, login, refreshToken, logout, getCurrentUser } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty()
], register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], login);

router.post('/refresh', refreshToken);

router.post('/logout', protect, logout);

router.get('/me', protect, getCurrentUser);

export default router;
