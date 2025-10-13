import axios from 'axios';

class GoogleBooksService {
  constructor() {
    this.baseUrl = 'https://www.googleapis.com/books/v1/volumes';
    this.apiKey = process.env.GOOGLE_BOOKS_API_KEY; // Optional - increases rate limits
  }

  /**
   * Search for a book by title
   */
  async searchByTitle(title) {
    try {
      const params = {
        q: `intitle:${title}`,
        maxResults: 1,
        printType: 'books'
      };

      if (this.apiKey) {
        params.key = this.apiKey;
      }

      const response = await axios.get(this.baseUrl, { params });

      if (response.data.items && response.data.items.length > 0) {
        return this.extractBookInfo(response.data.items[0]);
      }

      return null;
    } catch (error) {
      console.error('Error searching Google Books:', error.message);
      return null;
    }
  }

  /**
   * Search for a book by title and author
   */
  async searchByTitleAndAuthor(title, author) {
    try {
      const params = {
        q: `intitle:${title}+inauthor:${author}`,
        maxResults: 1,
        printType: 'books'
      };

      if (this.apiKey) {
        params.key = this.apiKey;
      }

      const response = await axios.get(this.baseUrl, { params });

      if (response.data.items && response.data.items.length > 0) {
        return this.extractBookInfo(response.data.items[0]);
      }

      return null;
    } catch (error) {
      console.error('Error searching Google Books:', error.message);
      return null;
    }
  }

  /**
   * Search for a book by ISBN
   */
  async searchByISBN(isbn) {
    try {
      const params = {
        q: `isbn:${isbn}`,
        maxResults: 1
      };

      if (this.apiKey) {
        params.key = this.apiKey;
      }

      const response = await axios.get(this.baseUrl, { params });

      if (response.data.items && response.data.items.length > 0) {
        return this.extractBookInfo(response.data.items[0]);
      }

      return null;
    } catch (error) {
      console.error('Error searching Google Books:', error.message);
      return null;
    }
  }

  /**
   * Get book cover image URL
   * Prioritizes larger images for better quality
   */
  getCoverImage(volumeInfo) {
    const imageLinks = volumeInfo.imageLinks;
    
    if (!imageLinks) {
      return null;
    }

    // Priority order: extraLarge > large > medium > small > thumbnail
    // Also upgrade http to https for security
    const coverUrl = 
      imageLinks.extraLarge ||
      imageLinks.large ||
      imageLinks.medium ||
      imageLinks.small ||
      imageLinks.thumbnail ||
      null;

    // Upgrade to https and remove zoom parameter for higher quality
    if (coverUrl) {
      return coverUrl
        .replace('http://', 'https://')
        .replace('&edge=curl', '') // Remove curl effect
        .replace('zoom=1', 'zoom=0'); // Get original size
    }

    return null;
  }

  /**
   * Extract relevant book information from Google Books API response
   */
  extractBookInfo(item) {
    const volumeInfo = item.volumeInfo;
    
    return {
      googleBooksId: item.id,
      title: volumeInfo.title,
      authors: volumeInfo.authors || [],
      description: volumeInfo.description || '',
      coverImage: this.getCoverImage(volumeInfo),
      publishDate: volumeInfo.publishedDate,
      isbn: this.extractISBN(volumeInfo.industryIdentifiers),
      pageCount: volumeInfo.pageCount,
      categories: volumeInfo.categories || [],
      language: volumeInfo.language || 'en',
      publisher: volumeInfo.publisher,
      averageRating: volumeInfo.averageRating,
      ratingsCount: volumeInfo.ratingsCount,
      previewLink: volumeInfo.previewLink,
      infoLink: volumeInfo.infoLink
    };
  }

  /**
   * Extract ISBN from industry identifiers
   */
  extractISBN(identifiers) {
    if (!identifiers || identifiers.length === 0) {
      return null;
    }

    // Prefer ISBN_13 over ISBN_10
    const isbn13 = identifiers.find(id => id.type === 'ISBN_13');
    if (isbn13) {
      return isbn13.identifier;
    }

    const isbn10 = identifiers.find(id => id.type === 'ISBN_10');
    if (isbn10) {
      return isbn10.identifier;
    }

    return identifiers[0].identifier;
  }

  /**
   * Get high-quality cover image URL from title
   */
  async getCoverImageByTitle(title, author = null) {
    try {
      const bookInfo = author 
        ? await this.searchByTitleAndAuthor(title, author)
        : await this.searchByTitle(title);

      return bookInfo ? bookInfo.coverImage : null;
    } catch (error) {
      console.error('Error getting cover image:', error.message);
      return null;
    }
  }
}

export default new GoogleBooksService();
