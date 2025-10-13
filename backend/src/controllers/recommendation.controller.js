import User from '../models/User.model.js';
import Book from '../models/Book.model.js';
import RecommendationLog from '../models/RecommendationLog.model.js';
import { AppError } from '../middleware/errorHandler.js';
import { RecommendationService } from '../services/recommendation.service.js';
import aiRecommendationService from '../services/aiRecommendation.service.js';
import { getTimeOfDay, getWeatherInfo } from '../utils/contextHelpers.js';

export const generateRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { 
      mood, 
      timeOfDay, 
      weather, 
      age, 
      constraints,
      location 
    } = req.body;

    // Get user data
    const user = await User.findById(userId)
      .populate('pastReads.bookId')
      .populate('likedSections.bookId');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Auto-detect context if not provided
    const finalTimeOfDay = timeOfDay || getTimeOfDay();
    let finalWeather = weather;
    
    if (!finalWeather && location) {
      finalWeather = await getWeatherInfo(location.lat, location.lon);
    }

    // Save mood to history
    if (mood) {
      user.moodHistory.push({ mood, at: new Date() });
      await user.save();
    }

    // Build recommendation context
    const context = {
      mood,
      timeOfDay: finalTimeOfDay,
      weather: finalWeather,
      age: age || user.age,
      constraints: constraints || {}
    };

    // Generate AI-powered recommendations
    console.log('🤖 Using AI recommendation engine...');
    const recommendations = await aiRecommendationService.generateRecommendations(
      user,
      context
    );

    // Log recommendations
    const log = await RecommendationLog.create({
      userId,
      context,
      recommendations: recommendations.map((rec, index) => ({
        bookId: null, // External books don't have local ID
        rank: index + 1,
        score: rec.score,
        why: rec.why,
        source: rec.source,
        externalData: {
          title: rec.title,
          authors: rec.authors,
          googleBooksId: rec.googleBooksId,
          coverImage: rec.coverImage
        }
      }))
    });

    res.json({
      success: true,
      data: {
        recommendations: recommendations.map(rec => ({
          title: rec.title,
          authors: rec.authors,
          description: rec.description,
          coverImage: rec.coverImage,
          genres: rec.genres,
          publishDate: rec.publishDate,
          pageCount: rec.pageCount,
          isbn: rec.isbn,
          averageRating: rec.averageRating,
          ratingsCount: rec.ratingsCount,
          googleBooksId: rec.googleBooksId,
          previewLink: rec.previewLink,
          infoLink: rec.infoLink,
          score: rec.score,
          why: rec.why,
          source: rec.source
        })),
        context,
        logId: log._id
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getRecommendationHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const logs = await RecommendationLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('recommendations.bookId', 'title authors coverImage');

    const total = await RecommendationLog.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        logs,
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
