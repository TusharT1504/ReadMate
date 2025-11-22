import { GoogleGenerativeAI } from '@google/generative-ai';
import { jsonrepair } from 'jsonrepair';
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
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192, // Increase to prevent truncation
      }
    });
    
    // Chat model with different settings for faster responses
    this.chatModel = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-001',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 30,
        maxOutputTokens: 2048,
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
      console.log('🔍 AI Response Preview:', aiResponse.substring(0, 300));

      // Step 4: Parse JSON response
      const allBooks = this.parseJsonArray(aiResponse, 'personalized');
      
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
      const randomGenres = genres.sort(() => 0.5 - Math.random()).slice(0, 3);
      
      const prompt = `You are an expert book curator. Recommend EXACTLY 12 diverse, highly-rated books focusing on these genres: ${randomGenres.join(', ')}.
      
      CRITICAL INSTRUCTIONS:
      1. Focus on these genres: ${randomGenres.join(', ')}.
      2. Include a mix of bestsellers and modern classics.
      3. Keep each "reason" field to MAX 45 characters!
      4. Provide 3 genres for each book.
      5. OUTPUT ONLY valid JSON - no markdown, no extra text.
      6. COMPLETE all 12 books with proper JSON closing brackets.
      
      REQUIRED FORMAT (output ONLY this, nothing else):
      [
        { "title": "Book Title", "author": "Author", "reason": "Max 45 chars", "genres": ["G1", "G2", "G3"] }
      ]
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('🔍 AI Random Response Preview:', text.substring(0, 300));
      const allBooks = this.parseJsonArray(text, 'random');
      
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

    const prompt = `You are an expert book recommendation system. Based on the following information, recommend EXACTLY 10 books that would be perfect for this reader.

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

CRITICAL INSTRUCTIONS:
1. Analyze the reading history to understand the user's preferences.
2. Consider the user's age and current context (time, weather, mood).
3. Recommend EXACTLY 10 books that match their taste and current situation.
4. ${randomFocus}
5. Keep each "reason" field to MAX 50 characters - be very concise!
6. Provide 3 genres for each book.
7. OUTPUT ONLY valid JSON - no markdown, no extra text.
8. COMPLETE all 10 books with proper JSON closing brackets.

REQUIRED FORMAT (output ONLY this, nothing else):
[
  { "title": "Book Title", "author": "Author Name", "reason": "Max 50 chars", "genres": ["Genre1", "Genre2", "Genre3"] }
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
      
      // Check if response is complete
      if (!response || !response.text) {
        throw new Error('Empty response from Gemini AI');
      }
      
      const text = response.text();
      
      // Check for minimum response length
      if (text.length < 50) {
        console.warn('⚠️ Unusually short AI response:', text);
      }
      
      return text;
    } catch (error) {
      console.error('Error calling Gemini AI:', error);
      console.error('Error details:', error.message);
      throw new Error(`Failed to generate AI recommendations: ${error.message}`);
    }
  }

  /**
   * Extract and repair JSON arrays returned by LLM responses.
   */
  parseJsonArray(text, contextLabel = 'ai') {
    console.log(`📋 Parsing ${contextLabel} JSON response...`);
    
    // First try to find JSON array in the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error(`❌ No JSON array found in ${contextLabel} recommendations response`);
      console.error('Response preview:', text.substring(0, 500));
      throw new Error('Failed to parse JSON from AI response - no JSON array found');
    }

    try {
      let jsonStr = jsonMatch[0];
      console.log(`📏 JSON string length: ${jsonStr.length} characters`);
      
      // Try to repair the JSON
      const repairedJson = jsonrepair(jsonStr);
      const parsed = JSON.parse(repairedJson);
      
      // Validate it's an array
      if (!Array.isArray(parsed)) {
        throw new Error('Parsed result is not an array');
      }
      
      // Validate array has items
      if (parsed.length === 0) {
        console.warn(`⚠️ ${contextLabel} response returned empty array`);
      }
      
      console.log(`✅ Successfully parsed ${parsed.length} items from ${contextLabel} response`);
      return parsed;
    } catch (parseError) {
      console.error(`❌ JSON parse error (${contextLabel}):`, parseError.message);
      console.error('Problematic JSON (first 500 chars):', jsonMatch[0].substring(0, 500));
      console.error('Problematic JSON (last 200 chars):', jsonMatch[0].substring(Math.max(0, jsonMatch[0].length - 200)));
      throw new Error(`Invalid JSON format from AI response: ${parseError.message}`);
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

  /**
   * Chat with a book using AI
   */
  async chatWithBook(title, authors, question) {
    try {
      const authorStr = Array.isArray(authors) ? authors.join(', ') : authors;
      
      const prompt = `Answer questions about the book "${title}" by ${authorStr}.
      
      User Question: "${question}"
      
      INSTRUCTIONS:
      1. Provide a clear, direct answer based on the book's content.
      2. For spoilers (endings, plot twists), give a brief warning first.
      3. Keep responses simple and conversational.
      4. Limit answer to 2-3 sentences (50-80 words).
      5. Avoid excessive formatting, emojis, or dramatic language.
      6. Return ONLY the answer text, no additional formatting.
      
      Answer:`;

      console.log('💬 Generating chat response for:', title);
      const result = await this.chatModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('✅ Chat response generated successfully');
      return text;
    } catch (error) {
      console.error('Error in chatWithBook:', error);
      console.error('Error details:', error.message);
      throw new Error(`Failed to get answer from the book: ${error.message}`);
    }
  }

  async generalBookChat(question) {
    try {
      const prompt = `You are a knowledgeable book assistant. Answer the following question about books.
      
      User Question: "${question}"
      
      INSTRUCTIONS:
      1. Provide helpful, accurate information about books, authors, or literature.
      2. For book recommendations, suggest 2-3 specific titles with brief reasons.
      3. Keep responses simple and conversational.
      4. Limit answer to 3-4 sentences (80-100 words).
      5. Avoid excessive formatting, emojis, or dramatic language.
      6. Return ONLY the answer text, no additional formatting.
      
      Answer:`;

      console.log('💬 Generating general chat response');
      const result = await this.chatModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('✅ General chat response generated successfully');
      return text;
    } catch (error) {
      console.error('Error in generalBookChat:', error);
      console.error('Error details:', error.message);
      throw new Error(`Failed to get answer: ${error.message}`);
    }
  }
}

export default new AIRecommendationService();
