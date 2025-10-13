import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  textSnippet: String
});

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  authors: {
    type: [String],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  genres: {
    type: [String],
    required: true
  },
  sections: [sectionSchema],
  metadata: {
    pages: Number,
    language: {
      type: String,
      default: 'en'
    },
    publishDate: Date,
    isbn: String,
    coverImage: String
  },
  embeddingsId: String,
  popularity: {
    reads: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    ratings: {
      count: {
        type: Number,
        default: 0
      },
      average: {
        type: Number,
        default: 0
      }
    }
  }
}, {
  timestamps: true
});

// Text indexes for search
bookSchema.index({ title: 'text', description: 'text', authors: 'text' });
bookSchema.index({ genres: 1 });
bookSchema.index({ 'popularity.ratings.average': -1 });
bookSchema.index({ 'popularity.reads': -1 });

const Book = mongoose.model('Book', bookSchema);

export default Book;
