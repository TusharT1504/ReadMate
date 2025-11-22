import User from '../models/User.model.js';
import Book from '../models/Book.model.js';
import RecommendationLog from '../models/RecommendationLog.model.js';
import { AppError } from '../middleware/errorHandler.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('pastReads.bookId', 'title authors coverImage')
      .populate('likedSections.bookId', 'title authors');

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, dob, gender } = req.body;

    const user = await User.findById(req.user._id);
    
    if (name) user.name = name;
    if (dob) user.dob = dob;
    if (gender) user.gender = gender;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const getLikedSections = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('likedSections.bookId', 'title authors coverImage');

    res.json({
      success: true,
      data: { likedSections: user.likedSections }
    });
  } catch (error) {
    next(error);
  }
};

export const addLikedSection = async (req, res, next) => {
  try {
    const { bookId, sectionId, text, tags, note } = req.body;

    if (!bookId || !text) {
      throw new AppError('BookId and text are required', 400);
    }

    const user = await User.findById(req.user._id);

    user.likedSections.push({
      bookId,
      sectionId,
      highlightText: text,
      note,
      tags: tags || [],
      timestamp: new Date()
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Section liked successfully',
      data: { likedSection: user.likedSections[user.likedSections.length - 1] }
    });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Get user's past reads
    const user = await User.findById(req.user._id)
      .populate('pastReads.bookId', 'title authors coverImage');

    // Get recommendation logs
    const recommendationLogs = await RecommendationLog.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('recommendations.bookId', 'title authors coverImage');

    // Combine and sort by timestamp
    const history = {
      pastReads: user.pastReads,
      recommendations: recommendationLogs,
      moodHistory: user.moodHistory
    };

    res.json({
      success: true,
      data: { history }
    });
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const { favoriteGenres, dislikedGenres, readingSpeed } = req.body;

    const user = await User.findById(req.user._id);

    if (favoriteGenres) user.preferences.favoriteGenres = favoriteGenres;
    if (dislikedGenres) user.preferences.dislikedGenres = dislikedGenres;
    if (readingSpeed) user.preferences.readingSpeed = readingSpeed;

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: { preferences: user.preferences }
    });
  } catch (error) {
    next(error);
  }
};

export const addFavorite = async (req, res, next) => {
  try {
    let { bookId, googleBooksId, title, authors, description, coverImage, genres, pageCount, publishDate, averageRating, ratingsCount } = req.body;

    if (!bookId && !googleBooksId) {
      throw new AppError('Book ID or Google Books ID is required', 400);
    }

    // If no bookId, find or create book
    if (!bookId && googleBooksId) {
      let book = await Book.findOne({ googleBooksId });
      if (!book) {
        // Create new book
        book = await Book.create({
          title: title || 'Unknown Title',
          authors: authors || ['Unknown Author'],
          description: description || 'No description available',
          genres: genres || [],
          googleBooksId,
          metadata: {
            coverImage,
            pageCount,
            publishDate
          },
          popularity: {
            ratings: {
              average: averageRating || 0,
              count: ratingsCount || 0
            }
          }
        });
      }
      bookId = book._id;
    }

    const user = await User.findById(req.user._id);
    
    user.favorites.addToSet(bookId);
    await user.save();

    res.json({
      success: true,
      message: 'Added to favorites',
      data: { favorites: user.favorites }
    });
  } catch (error) {
    next(error);
  }
};

export const removeFavorite = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const user = await User.findById(req.user._id);
    
    user.favorites = user.favorites.filter(id => id.toString() !== bookId);
    await user.save();

    res.json({
      success: true,
      message: 'Removed from favorites',
      data: { favorites: user.favorites }
    });
  } catch (error) {
    next(error);
  }
};

export const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favorites', 'title authors coverImage description averageRating');

    res.json({
      success: true,
      data: { favorites: user.favorites }
    });
  } catch (error) {
    next(error);
  }
};
