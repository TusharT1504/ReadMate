import User from '../models/User.model.js';
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
