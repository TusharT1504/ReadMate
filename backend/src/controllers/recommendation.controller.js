import User from '../models/User.model.js';
import Book from '../models/Book.model.js';
import RecommendationLog from '../models/RecommendationLog.model.js';
import { AppError } from '../middleware/errorHandler.js';
import { RecommendationService } from '../services/recommendation.service.js';
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

    // Generate recommendations using the service
    const recommendationService = new RecommendationService();
    const recommendations = await recommendationService.generateRecommendations(
      user,
      context
    );

    // Log recommendations
    const log = await RecommendationLog.create({
      userId,
      context,
      recommendations: recommendations.map((rec, index) => ({
        bookId: rec.book._id,
        rank: index + 1,
        score: rec.score,
        why: rec.why,
        source: rec.source
      }))
    });

    res.json({
      success: true,
      data: {
        recommendations: recommendations.map(rec => ({
          book: rec.book,
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
