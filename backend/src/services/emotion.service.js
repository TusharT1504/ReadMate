import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class EmotionDetectionService {
  constructor() {
    if (!process.env.HF_TOKEN) {
        console.log(process.env.HF_TOKEN)
      console.warn('⚠️  HF_TOKEN not found. Emotion detection will not be available.');
    }
    this.token = process.env.HF_TOKEN;
    this.model = 'dima806/facial_emotions_image_detection';
    this.apiUrl = `https://api-inference.huggingface.co/models/${this.model}`;
  }

  /**
   * Detect emotion from an image file
   * @param {string|Buffer} imageInput - Path to image file or buffer
   * @returns {Promise<Object>} Emotion detection results
   */
  async detectEmotionFromImage(imageInput) {
    try {
      let imageBuffer;

      // Handle both file path and buffer
      if (typeof imageInput === 'string') {
        imageBuffer = fs.readFileSync(imageInput);
      } else if (Buffer.isBuffer(imageInput)) {
        imageBuffer = imageInput;
      } else {
        throw new Error('Invalid image data. Must be file path or Buffer');
      }

      console.log('Processing image, size:', imageBuffer.length, 'bytes');
      console.log('Calling Hugging Face API:', this.apiUrl);

      // Call Hugging Face API directly using fetch
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/octet-stream',
        },
        body: imageBuffer,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Invalid Hugging Face token');
        } else if (response.status === 503) {
          throw new Error('Model is loading, please try again in a few moments');
        } else {
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }
      }

      const output = await response.json();
      console.log('Received response from Hugging Face:', output);

      // Validate response
      if (!output || !Array.isArray(output) || output.length === 0) {
        throw new Error('Invalid response from emotion detection model');
      }

      // Transform output to our mood format
      return this.mapEmotionsToMood(output);
    } catch (error) {
      console.error('❌ Error detecting emotion:', error.message);
      throw new Error(`Emotion detection failed: ${error.message}`);
    }
  }

  /**
   * Map Hugging Face emotions to ReadMate mood categories
   * @param {Array} emotions - Array of emotion predictions
   * @returns {Object} Mapped mood data
   */
  mapEmotionsToMood(emotions) {
    // Hugging Face returns emotions like: angry, disgust, fear, happy, sad, surprise, neutral
    // Map to our moods: happy, sad, adventurous, reflective, sleepy, anxious, energetic, romantic

    const emotionMap = {
      happy: 'happy',
      sad: 'sad',
      angry: 'anxious',
      fear: 'anxious',
      surprise: 'energetic',
      disgust: 'reflective',
      neutral: 'reflective',
    };

    // Sort by confidence score
    const sortedEmotions = emotions.sort((a, b) => b.score - a.score);
    const topEmotion = sortedEmotions[0];

    // Get mapped mood
    const detectedMood = emotionMap[topEmotion.label.toLowerCase()] || 'reflective';

    return {
      detectedMood,
      confidence: topEmotion.score,
      rawEmotions: sortedEmotions.map((e) => ({
        emotion: e.label,
        confidence: e.score,
      })),
      timestamp: new Date(),
    };
  }

  /**
   * Validate if emotion detection is available
   * @returns {boolean}
   */
  isAvailable() {
    return !!process.env.HF_TOKEN;
  }

  /**
   * Get mood suggestions based on detected emotion
   * @param {string} emotion - Detected emotion
   * @returns {Array<string>} Suggested moods
   */
  getSuggestedMoods(emotion) {
    const suggestions = {
      happy: ['happy', 'romantic', 'energetic'],
      sad: ['sad', 'reflective', 'sleepy'],
      angry: ['anxious', 'reflective', 'energetic'],
      fear: ['anxious', 'reflective'],
      surprise: ['energetic', 'adventurous', 'happy'],
      disgust: ['reflective', 'anxious'],
      neutral: ['reflective', 'happy', 'adventurous'],
    };

    return suggestions[emotion.toLowerCase()] || ['reflective'];
  }
}

export default new EmotionDetectionService();
