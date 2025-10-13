import searchService from '../services/search.service.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Search for books
 */
export const searchBooks = async (req, res, next) => {
  try {
    const { q, maxResults = 9 } = req.query;

    if (!q) {
      throw new AppError('Search query is required', 400);
    }

    const results = await searchService.searchBooks(q, parseInt(maxResults));

    res.json({
      success: true,
      data: {
        query: q,
        count: results.length,
        books: results
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get book details by Google Books ID
 */
export const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError('Book ID is required', 400);
    }

    const book = await searchService.getBookById(id);

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    res.json({
      success: true,
      data: { book }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search for a book and get AI-powered related recommendations
 */
export const searchWithRelated = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      throw new AppError('Search query is required', 400);
    }

    const result = await searchService.searchBookWithRelated(q);

    if (!result.mainBook) {
      throw new AppError('Book not found', 404);
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get related books for a specific book by ID
 */
export const getRelatedBooks = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError('Book ID is required', 400);
    }

    // Get the main book details
    const mainBook = await searchService.getBookById(id);

    if (!mainBook) {
      throw new AppError('Book not found', 404);
    }

    // Generate related recommendations
    const relatedBooks = await searchService.getRelatedBooks(
      mainBook.title,
      mainBook.authors,
      mainBook.categories,
      mainBook.description
    );

    res.json({
      success: true,
      data: {
        mainBook,
        relatedBooks
      }
    });
  } catch (error) {
    next(error);
  }
};
