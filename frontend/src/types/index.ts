export interface Book {
  _id?: string; // Optional for external books
  title: string;
  authors: string[];
  description: string;
  genres: string[];
  sections?: Array<{
    id: string;
    title: string;
    textSnippet: string;
  }>;
  metadata?: {
    pages?: number;
    language?: string;
    publishDate?: string;
    coverImage?: string;
    isbn?: string;
  };
  popularity?: {
    reads: number;
    likes: number;
    ratings: {
      count: number;
      average: number;
    };
  };
  // Google Books fields
  googleBooksId?: string;
  coverImage?: string;
  publishDate?: string;
  pageCount?: number;
  isbn?: string;
  averageRating?: number;
  ratingsCount?: number;
  previewLink?: string;
  infoLink?: string;
}

export interface Recommendation {
  book?: Book; // Optional for backward compatibility
  // AI recommendation fields
  title?: string;
  authors?: string[];
  description?: string;
  coverImage?: string;
  genres?: string[];
  publishDate?: string;
  pageCount?: number;
  isbn?: string;
  averageRating?: number;
  ratingsCount?: number;
  googleBooksId?: string;
  previewLink?: string;
  infoLink?: string;
  // Common fields
  score: number;
  why: string;
  source: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  dob?: string;
  age?: number;
  gender?: string;
  preferences?: {
    favoriteGenres: string[];
    dislikedGenres: string[];
    readingSpeed?: {
      wpm: number;
    };
  };
  likedSections?: LikedSection[];
  pastReads?: PastRead[];
  moodHistory?: MoodHistory[];
  favorites?: string[] | Book[];
}

export interface LikedSection {
  _id: string;
  bookId: string | Book;
  sectionId?: string;
  highlightText: string;
  note?: string;
  timestamp: string;
  tags: string[];
}

export interface PastRead {
  _id: string;
  bookId: string | Book;
  startedAt: string;
  finishedAt?: string;
  rating?: number;
  review?: string;
}

export interface MoodHistory {
  mood: string;
  at: string;
}

export interface RecommendationLog {
  _id: string;
  userId: string;
  context: {
    mood?: string;
    timeOfDay?: string;
    weather?: string;
    age?: number;
  };
  recommendations: Array<{
    bookId: string | Book;
    rank: number;
    score: number;
    why: string;
    source: string;
  }>;
  createdAt: string;
}
