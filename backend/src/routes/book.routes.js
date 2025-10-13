import express from 'express';
import { 
  searchBooks, 
  getBookById, 
  getBookSections,
  createBook,
  getAllBooks,
  searchGoogleBooks,
  updateBookCover
} from '../controllers/book.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/search', searchBooks);
router.get('/google-books', searchGoogleBooks); // New endpoint for Google Books search
router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.get('/:id/sections', getBookSections);

// Protected routes
router.post('/', protect, createBook);
router.patch('/:id/cover', protect, updateBookCover); // New endpoint to update cover

export default router;
