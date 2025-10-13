import Book from '../models/Book.model.js';
import { AppError } from '../middleware/errorHandler.js';
import googleBooksService from '../services/googleBooks.service.js';

export const searchBooks = async (req, res, next) => {
  try {
    const { q, genre, limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Genre filter
    if (genre) {
      query.genres = genre;
    }

    const books = await Book.find(query)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ 'popularity.ratings.average': -1, 'popularity.reads': -1 });

    const total = await Book.countDocuments(query);

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBooks = async (req, res, next) => {
  try {
    const { limit = 20, page = 1, sortBy = 'popularity' } = req.query;
    const skip = (page - 1) * limit;

    let sort = {};
    if (sortBy === 'popularity') {
      sort = { 'popularity.reads': -1 };
    } else if (sortBy === 'rating') {
      sort = { 'popularity.ratings.average': -1 };
    } else if (sortBy === 'recent') {
      sort = { createdAt: -1 };
    }

    const books = await Book.find()
      .limit(parseInt(limit))
      .skip(skip)
      .sort(sort);

    const total = await Book.countDocuments();

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    // Increment read count
    book.popularity.reads += 1;
    await book.save();

    res.json({
      success: true,
      data: { book }
    });
  } catch (error) {
    next(error);
  }
};

export const getBookSections = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).select('sections title authors');

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    res.json({
      success: true,
      data: { sections: book.sections }
    });
  } catch (error) {
    next(error);
  }
};

export const createBook = async (req, res, next) => {
  try {
    const bookData = req.body;

    // Auto-fetch cover image from Google Books if not provided
    if (!bookData.metadata?.coverImage) {
      console.log(`🔍 Fetching cover image for: ${bookData.title}`);
      
      const author = bookData.authors?.[0];
      const coverImage = await googleBooksService.getCoverImageByTitle(
        bookData.title, 
        author
      );

      if (coverImage) {
        console.log(`✅ Found cover image: ${coverImage}`);
        if (!bookData.metadata) {
          bookData.metadata = {};
        }
        bookData.metadata.coverImage = coverImage;
      } else {
        console.log(`⚠️  No cover image found for: ${bookData.title}`);
      }
    }

    const book = await Book.create(bookData);

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: { book }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search Google Books and get book info including cover image
 */
export const searchGoogleBooks = async (req, res, next) => {
  try {
    const { title, author, isbn } = req.query;

    if (!title && !isbn) {
      throw new AppError('Title or ISBN is required', 400);
    }

    let bookInfo;
    
    if (isbn) {
      bookInfo = await googleBooksService.searchByISBN(isbn);
    } else if (author) {
      bookInfo = await googleBooksService.searchByTitleAndAuthor(title, author);
    } else {
      bookInfo = await googleBooksService.searchByTitle(title);
    }

    if (!bookInfo) {
      throw new AppError('Book not found in Google Books', 404);
    }

    res.json({
      success: true,
      data: { book: bookInfo }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update book cover image from Google Books
 */
export const updateBookCover = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    const author = book.authors?.[0];
    const coverImage = await googleBooksService.getCoverImageByTitle(
      book.title,
      author
    );

    if (!coverImage) {
      throw new AppError('Cover image not found in Google Books', 404);
    }

    book.metadata.coverImage = coverImage;
    await book.save();

    res.json({
      success: true,
      message: 'Cover image updated successfully',
      data: { book }
    });
  } catch (error) {
    next(error);
  }
};
