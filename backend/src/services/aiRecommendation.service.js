import { GoogleGenerativeAI } from '@google/generative-ai';
import googleBooksService from './googleBooks.service.js';

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class AIRecommendationService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-001',
      generationConfig: {
        temperature: 0.9, // Increase randomness
        topP: 0.95,
        topK: 40,
      }
    });
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

      // Step 4: Parse JSON response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Failed to parse JSON from AI response');
      }
      
      const allBooks = JSON.parse(jsonMatch[0]);
      
      // Step 5: Shuffle and pick 5 random books from the generated list
      // This ensures variety even if the AI generates similar lists for similar contexts
      const shuffled = allBooks.sort(() => 0.5 - Math.random());
      const selectedBooks = shuffled.slice(0, 5);
      
      const bookTitles = selectedBooks.map(b => ({ title: b.title, author: b.author }));

      // Step 6: Fetch full book details from Google Books
      const recommendations = await this.fetchBookDetails(bookTitles);

      // Step 7: Add AI explanations and genres
      const finalRecommendations = recommendations.map((book, index) => {
        const aiInfo = selectedBooks.find(b => 
          b.title.toLowerCase().includes(book.title.toLowerCase()) || 
          book.title.toLowerCase().includes(b.title.toLowerCase())
        );

        // Merge genres from AI and Google Books
        let finalGenres = book.genres || [];
        if (aiInfo && aiInfo.genres && Array.isArray(aiInfo.genres)) {
          // Combine and deduplicate, putting AI genres first as they are often more specific
          finalGenres = [...new Set([...aiInfo.genres, ...finalGenres])];
        }

        return {
          ...book,
          genres: finalGenres,
          why: aiInfo ? aiInfo.reason : 'Recommended based on your reading history and preferences',
          score: 0.95 - (index * 0.05), // Higher score for earlier recommendations
          source: 'ai-personalized'
        };
      });

      console.log(`✅ Generated ${finalRecommendations.length} AI recommendations`);
      return finalRecommendations;
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      throw error;
    }
  }

  /**
   * Generate random book recommendations for cold start/new users
   */
  async getRandomRecommendations() {
    try {
      console.log('🎲 Generating random AI recommendations...');
      
      const genres = ['Fiction', 'Non-fiction', 'Sci-Fi', 'Mystery', 'Fantasy', 'Biography', 'History', 'Self-help', 'Thriller', 'Romance', 'Horror', 'Philosophy', 'Psychology', 'Business', 'Travel', 'Science'];
      // Pick 3 random genres to focus on
      const randomGenres = genres.sort(() => 0.5 - Math.random()).slice(0, 3);
      
      // Ask for 30 books to ensure variety
      const prompt = `You are an expert book curator. Recommend 30 diverse, highly-rated books focusing on these genres: ${randomGenres.join(', ')}, but also include others.
      
      INSTRUCTIONS:
      1. Focus on these genres: ${randomGenres.join(', ')}.
      2. Include a mix of bestsellers, hidden gems, and modern classics.
      3. Ensure these books are likely to be found in Google Books.
      4. Provide a brief, engaging reason why each book is worth reading.
      5. Provide 3 specific genres for each book (e.g., "Space Opera", "Historical Romance", "Hard Sci-Fi").
      6. Format the output as a JSON array of objects with 'title', 'author', 'reason', and 'genres' fields.
      
      Example format:
      [
        { "title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "reason": "A classic tale of the Jazz Age.", "genres": ["Classic Literature", "Historical Fiction", "Tragedy"] }
      ]
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON from the response (handling potential markdown code blocks)
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Failed to parse JSON from AI response');
      }
      
      const allBooks = JSON.parse(jsonMatch[0]);
      
      // Shuffle and pick 5
      const shuffled = allBooks.sort(() => 0.5 - Math.random());
      const selectedBooks = shuffled.slice(0, 5);
      
      const bookTitles = selectedBooks.map(b => ({ title: b.title, author: b.author }));
      
      // Fetch details from Google Books
      const recommendations = await this.fetchBookDetails(bookTitles);
      
      // Add AI explanations and genres
      const finalRecommendations = recommendations.map((book) => {
        const aiInfo = selectedBooks.find(b => 
          b.title.toLowerCase().includes(book.title.toLowerCase()) || 
          book.title.toLowerCase().includes(b.title.toLowerCase())
        );
        
        // Merge genres from AI and Google Books
        let finalGenres = book.genres || [];
        if (aiInfo && aiInfo.genres && Array.isArray(aiInfo.genres)) {
          // Combine and deduplicate, putting AI genres first
          finalGenres = [...new Set([...aiInfo.genres, ...finalGenres])];
        }

        return {
          ...book,
          genres: finalGenres,
          why: aiInfo ? aiInfo.reason : 'A highly recommended read.',
          score: 80 + Math.floor(Math.random() * 15), // Random score for "random" recommendations
          source: 'ai-random'
        };
      });

      console.log(`✅ Generated ${finalRecommendations.length} random recommendations`);
      return finalRecommendations;

    } catch (error) {
      console.error('Error generating random recommendations:', error);
      return [];
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

    // Add random discovery focus
    const discoveryModes = [
      "Focus on hidden gems and underrated books.",
      "Focus on award-winning masterpieces.",
      "Focus on books with unique writing styles.",
      "Focus on books that are perfect for this specific time of day and weather.",
      "Focus on diverse authors and perspectives.",
      "Mix well-known bestsellers with obscure finds."
    ];
    const randomFocus = discoveryModes[Math.floor(Math.random() * discoveryModes.length)];

    const prompt = `You are an expert book recommendation system. Based on the following information, recommend 20 books that would be perfect for this reader.

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
1. Analyze the reading history to understand the user's preferences.
2. Consider the user's age and current context (time, weather, mood).
3. Recommend 20 books that match their taste and current situation.
4. ${randomFocus}
5. Ensure variety in the recommendations (mix of genres if appropriate).
6. Provide a brief reasoning for each recommendation.
7. Provide 3 specific genres for each book (e.g., "Dystopian Fiction", "Cyberpunk", "Coming of Age").
8. Format the output as a JSON array of objects with 'title', 'author', 'reason', and 'genres' fields.

Example format:
[
  { "title": "Book Title", "author": "Author Name", "reason": "Reason for recommendation", "genres": ["Genre 1", "Genre 2", "Genre 3"] }
]
`;

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
