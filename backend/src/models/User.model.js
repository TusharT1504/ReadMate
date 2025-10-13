import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const likedSectionSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  sectionId: String,
  highlightText: {
    type: String,
    required: true
  },
  note: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  tags: [String]
});

const pastReadSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  startedAt: {
    type: Date,
    required: true
  },
  finishedAt: Date,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: String
});

const moodHistorySchema = new mongoose.Schema({
  mood: {
    type: String,
    required: true
  },
  at: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  dob: Date,
  age: Number,
  gender: String,
  preferences: {
    favoriteGenres: [String],
    dislikedGenres: [String],
    readingSpeed: {
      wpm: Number
    }
  },
  likedSections: [likedSectionSchema],
  pastReads: [pastReadSchema],
  moodHistory: [moodHistorySchema],
  refreshToken: String
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Calculate age from dob
userSchema.pre('save', function(next) {
  if (this.dob) {
    const today = new Date();
    const birthDate = new Date(this.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    this.age = age;
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
