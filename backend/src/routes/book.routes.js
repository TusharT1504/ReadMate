import express from 'express';
import { 
  searchBooks, 
  getBookById, 
  getBookSections,
  createBook,
  getAllBooks
} from '../controllers/book.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/search', searchBooks);
router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.get('/:id/sections', getBookSections);

// Protected routes
router.post('/', protect, createBook);

export default router;
