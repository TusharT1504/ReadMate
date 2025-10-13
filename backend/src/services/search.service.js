import { GoogleGenerativeAI } from '@google/generative-ai';
import googleBooksService from './googleBooks.service.js';

class SearchService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  /**
   * Search for books using Google Books API
   */
  async searchBooks(query, maxResults = 10) {
    try {
      const params = {
        q: query,
        maxResults: Math.min(maxResults, 40), // Google Books API limit
        printType: 'books',
        orderBy: 'relevance'
      };

      if (process.env.GOOGLE_BOOKS_API_KEY) {
        params.key = process.env.GOOGLE_BOOKS_API_KEY;
      }

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?${new URLSearchParams(params)}`
      );

      const data = await response.json();

      if (data.items && data.items.length > 0) {
        return data.items.map(item => googleBooksService.extractBookInfo(item));
      }

      return [];
    } catch (error) {
      console.error('Error searching books:', error.message);
      return [];
    }
  }

  /**
   * Get book details by Google Books ID
   */
  async getBookById(googleBooksId) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes/${googleBooksId}`
      );

      const data = await response.json();

      if (data.volumeInfo) {
        return googleBooksService.extractBookInfo(data);
      }

      return null;
    } catch (error) {
      console.error('Error getting book by ID:', error.message);
      return null;
    }
  }

  /**
   * Generate related books using Gemini AI
   */
  async getRelatedBooks(bookTitle, bookAuthors = [], bookCategories = [], bookDescription = '') {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `Given the following book:
Title: ${bookTitle}
Authors: ${bookAuthors.join(', ') || 'Unknown'}
Genres: ${bookCategories.join(', ') || 'General'}
Description: ${bookDescription.substring(0, 300)}

Recommend 9 similar books that a reader who enjoyed this book would also like. Consider:
- Similar themes, writing style, and genres
- Books by the same or similar authors
- Books with comparable plot structures or settings
- Both classic and contemporary options

For each book, provide:
1. Title
2. Author
3. Brief reason why it's similar (1 sentence)

Format your response as a JSON array with objects containing: title, author, and reason fields.
Return ONLY the JSON array, no additional text or markdown formatting.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse the AI response
      let recommendations = [];
      try {
        // Remove markdown code blocks if present
        const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        recommendations = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Fallback: try to extract JSON from text
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          recommendations = JSON.parse(jsonMatch[0]);
        }
      }

      // Fetch actual book data from Google Books for each recommendation
      const relatedBooksWithData = await Promise.all(
        recommendations.slice(0, 9).map(async (rec) => {
          const bookData = await googleBooksService.searchByTitleAndAuthor(rec.title, rec.author);
          return {
            ...rec,
            bookData: bookData || {
              title: rec.title,
              authors: [rec.author],
              coverImage: null,
              description: rec.reason
            }
          };
        })
      );

      return relatedBooksWithData;
    } catch (error) {
      console.error('Error generating related books:', error.message);
      return [];
    }
  }

  /**
   * Search for a specific book and get related recommendations
   */
  async searchBookWithRelated(query) {
    try {
      // First, search for the main book
      const searchResults = await this.searchBooks(query, 1);

      if (searchResults.length === 0) {
        return {
          mainBook: null,
          relatedBooks: []
        };
      }

      const mainBook = searchResults[0];

      // Generate related book recommendations
      const relatedBooks = await this.getRelatedBooks(
        mainBook.title,
        mainBook.authors,
        mainBook.categories,
        mainBook.description
      );

      return {
        mainBook,
        relatedBooks
      };
    } catch (error) {
      console.error('Error in searchBookWithRelated:', error.message);
      throw error;
    }
  }

  /**
   * Quick search for multiple books (for search results page)
   */
  async quickSearchBooks(query, maxResults = 9) {
    return this.searchBooks(query, maxResults);
  }
}

export default new SearchService();
