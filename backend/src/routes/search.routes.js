import express from 'express';
import {
  searchBooks,
  getBookById,
  searchWithRelated,
  getRelatedBooks
} from '../controllers/search.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public search routes (no auth required)
router.get('/books', searchBooks);
router.get('/books/:id', getBookById);
router.get('/with-related', searchWithRelated);
router.get('/books/:id/related', getRelatedBooks);

// Protected routes (require authentication)
// Add these if you want to make search available only to logged-in users
// router.get('/books', protect, searchBooks);
// router.get('/books/:id', protect, getBookById);

export default router;
