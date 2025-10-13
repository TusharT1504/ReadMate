import Book from '../models/Book.model.js';
import { EmbeddingService } from './embedding.service.js';
import { LangChainService } from './langchain.service.js';

export class RecommendationService {
  constructor() {
    this.embeddingService = new EmbeddingService();
    this.langChainService = new LangChainService();
    
    // Configurable weights for hybrid scoring
    this.weights = {
      semantic: 0.35,
      collaborative: 0.2,
      popularity: 0.15,
      recency: 0.1,
      context: 0.2
    };
  }

  async generateRecommendations(user, context) {
    try {
      // Step 1: Get candidates from different sources
      const semanticCandidates = await this.getSemanticCandidates(user, context);
      const collaborativeCandidates = await this.getCollaborativeCandidates(user);
      const contextualCandidates = await this.getContextualCandidates(context);

      // Step 2: Merge and deduplicate candidates
      const allCandidates = this.mergeCandidates([
        semanticCandidates,
        collaborativeCandidates,
        contextualCandidates
      ]);

      // Step 3: Compute hybrid scores
      const scoredCandidates = await this.computeHybridScores(
        allCandidates,
        user,
        context
      );

      // Step 4: Rerank with LangChain RAG for explanations
      const finalRecommendations = await this.reRankWithExplanations(
        scoredCandidates.slice(0, 10), // Top 10 for LLM processing
        user,
        context
      );

      return finalRecommendations.slice(0, 5); // Return top 5
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Fallback to simple popularity-based recommendations
      return await this.getFallbackRecommendations(user);
    }
  }

  async getSemanticCandidates(user, context) {
    // Get books similar to user's liked sections and past reads
    const userInterests = [
      ...user.likedSections.map(ls => ls.highlightText),
      ...user.pastReads.filter(pr => pr.rating >= 4).map(pr => pr.bookId?.description || '')
    ].filter(Boolean).join(' ');

    if (!userInterests) {
      return [];
    }

    // For MVP, use genre matching
    // In Phase 2, this will use vector similarity
    const favoriteGenres = user.preferences?.favoriteGenres || [];
    const dislikedGenres = user.preferences?.dislikedGenres || [];

    const query = {
      ...(favoriteGenres.length > 0 && { genres: { $in: favoriteGenres } }),
      ...(dislikedGenres.length > 0 && { genres: { $nin: dislikedGenres } })
    };

    const books = await Book.find(query)
      .limit(20)
      .sort({ 'popularity.ratings.average': -1 });

    return books.map(book => ({
      book,
      semanticScore: 0.8, // Placeholder
      source: 'semantic'
    }));
  }

  async getCollaborativeCandidates(user) {
    // Simplified collaborative filtering for MVP
    // Find users who liked similar books
    const userBookIds = user.pastReads
      .filter(pr => pr.rating >= 4)
      .map(pr => pr.bookId?._id)
      .filter(Boolean);

    if (userBookIds.length === 0) {
      return [];
    }

    // Find popular books in same genres
    const userGenres = user.preferences?.favoriteGenres || [];
    
    const books = await Book.find({
      _id: { $nin: userBookIds },
      ...(userGenres.length > 0 && { genres: { $in: userGenres } })
    })
      .limit(15)
      .sort({ 'popularity.reads': -1 });

    return books.map(book => ({
      book,
      collaborativeScore: 0.7, // Placeholder
      source: 'collaborative'
    }));
  }

  async getContextualCandidates(context) {
    // Map mood and context to genres/book characteristics
    const moodGenreMap = {
      happy: ['romance', 'comedy', 'adventure'],
      sad: ['drama', 'literary fiction', 'poetry'],
      adventurous: ['adventure', 'fantasy', 'thriller'],
      reflective: ['philosophy', 'literary fiction', 'biography'],
      sleepy: ['short stories', 'poetry', 'light fiction'],
      anxious: ['self-help', 'mindfulness', 'comedy'],
      energetic: ['action', 'thriller', 'adventure']
    };

    const timeGenreMap = {
      morning: ['self-help', 'business', 'biography'],
      afternoon: ['fiction', 'mystery', 'adventure'],
      evening: ['fiction', 'drama', 'romance'],
      night: ['thriller', 'mystery', 'philosophy']
    };

    const genres = [
      ...(moodGenreMap[context.mood?.toLowerCase()] || []),
      ...(timeGenreMap[context.timeOfDay?.toLowerCase()] || [])
    ];

    if (genres.length === 0) {
      return [];
    }

    const books = await Book.find({
      genres: { $in: genres }
    })
      .limit(15)
      .sort({ 'popularity.ratings.average': -1 });

    return books.map(book => ({
      book,
      contextScore: 0.75, // Placeholder
      source: 'context'
    }));
  }

  mergeCandidates(candidateLists) {
    const bookMap = new Map();

    for (const candidates of candidateLists) {
      for (const candidate of candidates) {
        const bookId = candidate.book._id.toString();
        
        if (bookMap.has(bookId)) {
          // Merge scores
          const existing = bookMap.get(bookId);
          bookMap.set(bookId, {
            ...existing,
            semanticScore: Math.max(existing.semanticScore || 0, candidate.semanticScore || 0),
            collaborativeScore: Math.max(existing.collaborativeScore || 0, candidate.collaborativeScore || 0),
            contextScore: Math.max(existing.contextScore || 0, candidate.contextScore || 0)
          });
        } else {
          bookMap.set(bookId, candidate);
        }
      }
    }

    return Array.from(bookMap.values());
  }

  async computeHybridScores(candidates, user, context) {
    const now = Date.now();

    return candidates.map(candidate => {
      const book = candidate.book;

      // Semantic score
      const semanticScore = candidate.semanticScore || 0;

      // Collaborative score
      const collaborativeScore = candidate.collaborativeScore || 0;

      // Popularity score (normalized)
      const popularityScore = this.normalizePopularity(book.popularity);

      // Recency score
      const recencyScore = this.calculateRecencyScore(book.createdAt, now);

      // Context score
      const contextScore = candidate.contextScore || 0;

      // Compute weighted hybrid score
      const hybridScore = 
        this.weights.semantic * semanticScore +
        this.weights.collaborative * collaborativeScore +
        this.weights.popularity * popularityScore +
        this.weights.recency * recencyScore +
        this.weights.context * contextScore;

      return {
        ...candidate,
        score: hybridScore,
        popularityScore,
        recencyScore
      };
    }).sort((a, b) => b.score - a.score);
  }

  normalizePopularity(popularity) {
    // Simple normalization (can be improved with actual data distribution)
    const reads = popularity?.reads || 0;
    const avgRating = popularity?.ratings?.average || 0;
    
    return Math.min((reads / 1000) * 0.5 + (avgRating / 5) * 0.5, 1);
  }

  calculateRecencyScore(publishDate, now) {
    if (!publishDate) return 0.5;
    
    const ageInDays = (now - new Date(publishDate).getTime()) / (1000 * 60 * 60 * 24);
    const ageInYears = ageInDays / 365;
    
    // Newer books get higher scores, but not too aggressive
    return Math.max(0, 1 - (ageInYears / 10));
  }

  async reRankWithExplanations(candidates, user, context) {
    // For MVP, generate simple rule-based explanations
    // In Phase 2, this will use LangChain LLM
    
    return candidates.map(candidate => ({
      book: candidate.book,
      score: candidate.score,
      why: this.generateExplanation(candidate, user, context),
      source: this.determineSource(candidate)
    }));
  }

  generateExplanation(candidate, user, context) {
    const book = candidate.book;
    const reasons = [];

    // Genre match
    const matchedGenres = book.genres.filter(g => 
      user.preferences?.favoriteGenres?.includes(g)
    );
    if (matchedGenres.length > 0) {
      reasons.push(`matches your interest in ${matchedGenres[0]}`);
    }

    // Mood match
    if (context.mood) {
      reasons.push(`fits your ${context.mood} mood`);
    }

    // Time of day
    if (context.timeOfDay === 'night' && book.genres.includes('thriller')) {
      reasons.push('perfect for evening reading');
    }

    // High rating
    if (book.popularity?.ratings?.average >= 4) {
      reasons.push('highly rated by readers');
    }

    // Default
    if (reasons.length === 0) {
      reasons.push('recommended based on your reading profile');
    }

    return `Because it ${reasons.join(' and ')}`;
  }

  determineSource(candidate) {
    if (candidate.semanticScore > 0.5 && candidate.collaborativeScore > 0.5) {
      return 'rag+cf';
    } else if (candidate.semanticScore > 0.5) {
      return 'semantic';
    } else if (candidate.collaborativeScore > 0.5) {
      return 'collaborative';
    } else {
      return 'hybrid';
    }
  }

  async getFallbackRecommendations(user) {
    // Simple fallback: return popular books
    const books = await Book.find()
      .limit(5)
      .sort({ 'popularity.ratings.average': -1, 'popularity.reads': -1 });

    return books.map(book => ({
      book,
      score: 0.7,
      why: 'Popular recommendation',
      source: 'heuristic'
    }));
  }
}
