import emotionService from '../services/emotion.service.js';

/**
 * @route   POST /api/emotion/detect
 * @desc    Detect emotion from uploaded image
 * @access  Private
 */
export const detectEmotion = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file',
      });
    }

    // Check if service is available
    if (!emotionService.isAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'Emotion detection service is not configured',
      });
    }

    // Detect emotion from uploaded image buffer
    const result = await emotionService.detectEmotionFromImage(req.file.buffer);

    // Get suggested moods based on top emotion
    const suggestions = emotionService.getSuggestedMoods(
      result.rawEmotions[0].emotion
    );

    res.json({
      success: true,
      data: {
        mood: result.detectedMood,
        confidence: result.confidence,
        suggestions,
        details: result.rawEmotions,
      },
    });
  } catch (error) {
    console.error('Error in detectEmotion:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to detect emotion',
    });
  }
};

/**
 * @route   GET /api/emotion/status
 * @desc    Check if emotion detection is available
 * @access  Public
 */
export const getStatus = async (req, res) => {
  try {
    const available = emotionService.isAvailable();

    res.json({
      success: true,
      data: {
        available,
        model: 'dima806/facial_emotions_image_detection',
        provider: 'Hugging Face',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check service status',
    });
  }
};
