import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: false // Not required for external books
  },
  rank: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  why: String,
  source: {
    type: String,
    enum: ['semantic', 'collaborative', 'rag', 'hybrid', 'rag+cf', 'heuristic', 'ai-google-books', 'ai-personalized', 'ai-random'],
    default: 'hybrid'
  },
  externalData: {
    title: String,
    authors: [String],
    googleBooksId: String,
    coverImage: String
  }
});

const recommendationLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  context: {
    mood: String,
    timeOfDay: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night']
    },
    weather: String,
    age: Number,
    device: String
  },
  recommendations: [recommendationSchema],
  feedback: {
    type: String,
    enum: ['like', 'dislike', 'neutral', 'skipped']
  }
}, {
  timestamps: true
});

// Index for efficient queries
recommendationLogSchema.index({ userId: 1, createdAt: -1 });
recommendationLogSchema.index({ 'context.mood': 1 });

const RecommendationLog = mongoose.model('RecommendationLog', recommendationLogSchema);

export default RecommendationLog;
