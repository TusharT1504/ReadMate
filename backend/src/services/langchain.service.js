// Phase 2 - LangChain RAG integration with Google Gemini
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';

export class LangChainService {
  constructor() {
    // Initialize LangChain with Gemini in Phase 2
    this.llm = null;
    if (process.env.GEMINI_API_KEY) {
      this.llm = new ChatGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY,
        modelName: 'gemini-pro',
        temperature: 0.7,
        maxOutputTokens: 1024,
      });
    }
  }

  async generateExplanations(books, userProfile, context) {
    // Phase 2: Use LangChain to generate personalized explanations
    if (!this.llm) {
      console.log('LangChain Gemini service not initialized');
      return books.map(book => ({
        bookId: book._id,
        explanation: 'Generated explanation placeholder'
      }));
    }

    try {
      const template = PromptTemplate.fromTemplate(`
        You are a book recommendation assistant. Generate a personalized explanation for why this book is recommended.
        
        User Profile:
        - Favorite Genres: {favoriteGenres}
        - Past Reads: {pastReads}
        - Current Mood: {mood}
        - Time of Day: {timeOfDay}
        - Weather: {weather}
        
        Book:
        - Title: {bookTitle}
        - Author: {bookAuthor}
        - Genres: {bookGenres}
        - Description: {bookDescription}
        
        Generate a brief, friendly explanation (2-3 sentences) of why this book matches the user's current context and preferences.
      `);

      const explanations = await Promise.all(
        books.map(async (book) => {
          const prompt = await template.format({
            favoriteGenres: userProfile.favoriteGenres?.join(', ') || 'None',
            pastReads: userProfile.pastReads?.slice(0, 3).map(r => r.bookId?.title).join(', ') || 'None',
            mood: context.mood || 'neutral',
            timeOfDay: context.timeOfDay || 'any',
            weather: context.weather || 'any',
            bookTitle: book.title,
            bookAuthor: book.author,
            bookGenres: book.genres.join(', '),
            bookDescription: book.description,
          });

          const response = await this.llm.invoke(prompt);
          return {
            bookId: book._id,
            explanation: response.content,
          };
        })
      );

      return explanations;
    } catch (error) {
      console.error('Error generating explanations with Gemini:', error);
      return books.map(book => ({
        bookId: book._id,
        explanation: 'A great match for your current mood and preferences!'
      }));
    }
  }

  async buildRetrievalChain() {
    // Phase 2: Build retriever -> reranker chain
    console.log('Retrieval chain placeholder');
    return null;
  }
}
