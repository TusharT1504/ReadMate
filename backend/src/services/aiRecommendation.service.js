import { GoogleGenerativeAI } from '@google/generative-ai';
import googleBooksService from './googleBooks.service.js';

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class AIRecommendationService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });
  }

  /**
   * Generate AI-powered book recommendations based on user history and context
   */
  async generateRecommendations(user, context) {
    try {
      console.log('🤖 Generating AI recommendations...');

      // Step 1: Prepare user reading history
      const readingHistory = this.prepareReadingHistory(user);

      // Step 2: Create AI prompt with context
      const prompt = this.createRecommendationPrompt(readingHistory, user, context);

      // Step 3: Get AI recommendations
      const aiResponse = await this.getAIRecommendations(prompt);

      // Step 4: Parse book titles from AI response
      const bookTitles = this.parseBookTitles(aiResponse);

      // Step 5: Fetch full book details from Google Books
      const recommendations = await this.fetchBookDetails(bookTitles);

      // Step 6: Add AI explanations
      const finalRecommendations = this.addExplanations(recommendations, aiResponse);

      console.log(`✅ Generated ${finalRecommendations.length} AI recommendations`);
      return finalRecommendations;
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      throw error;
    }
  }

  /**
   * Prepare user reading history from past 10 books
   */
  prepareReadingHistory(user) {
    const pastReads = user.pastReads || [];
    
    // Get last 10 books with ratings
    const recentBooks = pastReads
      .sort((a, b) => new Date(b.readAt) - new Date(a.readAt))
      .slice(0, 10)
      .map(read => ({
        title: read.bookId?.title || 'Unknown',
        authors: read.bookId?.authors || [],
        genres: read.bookId?.genres || [],
        rating: read.rating,
        readAt: read.readAt
      }));

    return recentBooks;
  }

  /**
   * Create comprehensive AI prompt with all context
   */
  createRecommendationPrompt(readingHistory, user, context) {
    const userAge = user.age || this.calculateAge(user.dob);
    const timeOfDay = context.timeOfDay || 'unknown';
    const weather = context.weather || 'unknown';
    const mood = context.mood || 'unknown';

    const historyText = readingHistory.length > 0
      ? readingHistory.map((book, i) => 
          `${i + 1}. "${book.title}" by ${book.authors.join(', ')} - Genres: ${book.genres.join(', ')} - Rating: ${book.rating}/5`
        ).join('\n')
      : 'No reading history available';

    const prompt = `You are an expert book recommendation system. Based on the following information, recommend 5 books that would be perfect for this reader.

USER PROFILE:
- Age: ${userAge} years old
- Gender: ${user.gender || 'not specified'}
- Favorite Genres: ${user.preferences?.favoriteGenres?.join(', ') || 'not specified'}
- Disliked Genres: ${user.preferences?.dislikedGenres?.join(', ') || 'none'}

READING HISTORY (Last 10 books):
${historyText}

CURRENT CONTEXT:
- Time of Day: ${timeOfDay}
- Weather: ${weather}
- Mood: ${mood}

INSTRUCTIONS:
1. Analyze the reading history to understand the user's preferences
2. Consider the user's age and current context (time, weather, mood)
3. Recommend 9 books that match their taste and current situation
4. Provide ONLY the exact book title and author for each recommendation
5. Format each recommendation as: "Book Title" by Author Name
6. After the 9 recommendations, add a "REASONING:" section explaining why each book was recommended

Example format:
1. "The Midnight Library" by Matt Haig
2. "Atomic Habits" by James Clear
3. "Project Hail Mary" by Andy Weir
4. "The House in the Cerulean Sea" by TJ Klune
5. "Educated" by Tara Westover
6. "The Seven Husbands of Evelyn Hugo" by Taylor Jenkins Reid
7. "Where the Crawdads Sing" by Delia Owens
8. "Circe" by Madeline Miller
9. "The Silent Patient" by Alex Michaelides

REASONING:
1. The Midnight Library - [explanation]
2. Atomic Habits - [explanation]
...

Now provide your 9 recommendations:`;

    return prompt;
  }

  /**
   * Get recommendations from Gemini AI
   */
  async getAIRecommendations(prompt) {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return text;
    } catch (error) {
      console.error('Error calling Gemini AI:', error);
      throw new Error('Failed to generate AI recommendations');
    }
  }

  /**
   * Parse book titles and authors from AI response
   */
  parseBookTitles(aiResponse) {
    const lines = aiResponse.split('\n');
    const bookTitles = [];

    // Find lines with book recommendations (numbered list)
    for (const line of lines) {
      // Match pattern: 1. "Book Title" by Author Name
      const match = line.match(/^\d+\.\s*[""](.+?)[""](?:\s+by\s+(.+))?$/i);
      if (match) {
        const title = match[1].trim();
        const author = match[2]?.trim().replace(/\.$/, '') || '';
        bookTitles.push({ title, author });

        // Stop after finding reasoning section
        if (bookTitles.length >= 9) break;
      }
    }

    console.log(`📚 Parsed ${bookTitles.length} book titles from AI response`);
    return bookTitles;
  }

  /**
   * Fetch full book details from Google Books API
   */
  async fetchBookDetails(bookTitles) {
    const recommendations = [];

    for (const { title, author } of bookTitles) {
      try {
        console.log(`🔍 Fetching details for: ${title} by ${author}`);
        
        let bookInfo;
        if (author) {
          bookInfo = await googleBooksService.searchByTitleAndAuthor(title, author);
        } else {
          bookInfo = await googleBooksService.searchByTitle(title);
        }

        if (bookInfo) {
          recommendations.push({
            title: bookInfo.title,
            authors: bookInfo.authors,
            description: bookInfo.description,
            coverImage: bookInfo.coverImage,
            genres: bookInfo.categories || [],
            publishDate: bookInfo.publishDate,
            pageCount: bookInfo.pageCount,
            isbn: bookInfo.isbn,
            language: bookInfo.language,
            publisher: bookInfo.publisher,
            averageRating: bookInfo.averageRating,
            ratingsCount: bookInfo.ratingsCount,
            googleBooksId: bookInfo.googleBooksId,
            previewLink: bookInfo.previewLink,
            infoLink: bookInfo.infoLink,
            source: 'ai-google-books'
          });
          console.log(`✅ Found: ${bookInfo.title}`);
        } else {
          console.log(`⚠️  Not found in Google Books: ${title}`);
        }
      } catch (error) {
        console.error(`Error fetching ${title}:`, error.message);
      }
    }

    return recommendations;
  }

  /**
   * Add AI explanations to recommendations
   */
  addExplanations(recommendations, aiResponse) {
    // Extract reasoning section
    const reasoningMatch = aiResponse.match(/REASONING:(.+?)$/is);
    const reasoningText = reasoningMatch ? reasoningMatch[1] : '';

    const explanations = [];
    const lines = reasoningText.split('\n').filter(line => line.trim());

    for (const line of lines) {
      // Match pattern: 1. Title - Explanation
      const match = line.match(/^\d+\.\s*(?:[""]?(.+?)[""]?\s*-\s*)?(.+)$/i);
      if (match) {
        explanations.push(match[2].trim());
      }
    }

    // Add explanations to recommendations
    return recommendations.map((rec, index) => ({
      ...rec,
      why: explanations[index] || 'Recommended based on your reading history and preferences',
      score: 0.95 - (index * 0.05) // Higher score for earlier recommendations
    }));
  }

  /**
   * Calculate age from date of birth
   */
  calculateAge(dob) {
    if (!dob) return 'unknown';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Fallback recommendations if AI fails
   */
  async getFallbackRecommendations() {
    const fallbackTitles = [
      { title: 'The Midnight Library', author: 'Matt Haig' },
      { title: 'Atomic Habits', author: 'James Clear' },
      { title: 'Project Hail Mary', author: 'Andy Weir' },
      { title: 'The House in the Cerulean Sea', author: 'TJ Klune' },
      { title: 'Educated', author: 'Tara Westover' }
    ];

    const recommendations = await this.fetchBookDetails(fallbackTitles);
    return recommendations.map((rec, index) => ({
      ...rec,
      why: 'Popular bestseller that readers love',
      score: 0.8 - (index * 0.05)
    }));
  }
}

export default new AIRecommendationService();
