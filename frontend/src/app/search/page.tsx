'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { Search, Loader2, BookOpen, Star } from 'lucide-react';
import api from '@/lib/api';

interface Book {
  googleBooksId: string;
  title: string;
  authors: string[];
  description: string;
  coverImage: string | null;
  publishDate: string;
  categories: string[];
  averageRating?: number;
  ratingsCount?: number;
  pageCount?: number;
}

interface RelatedBook {
  title: string;
  author: string;
  reason: string;
  bookData: Book;
}

interface SearchResult {
  mainBook: Book;
  relatedBooks: RelatedBook[];
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchMode, setSearchMode] = useState<'quick' | 'detailed'>('quick');
  const [quickResults, setQuickResults] = useState<Book[]>([]);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  const handleQuickSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a book title to search');
      return;
    }

    setLoading(true);
    setError('');
    setQuickResults([]);
    setSearchResult(null);
    setSearchMode('quick');

    try {
      const response = await api.get(`/search/books?q=${encodeURIComponent(query)}&maxResults=9`);
      setQuickResults(response.data.data.books);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDetailedSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a book title to search');
      return;
    }

    setLoading(true);
    setError('');
    setQuickResults([]);
    setSearchResult(null);
    setSearchMode('detailed');

    try {
      const response = await api.get(`/search/with-related?q=${encodeURIComponent(query)}`);
      setSearchResult(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (bookId: string) => {
    // For Google Books, navigate to external book page
    router.push(`/book-external/${bookId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Search Books</h1>
          <p className="text-gray-600">
            Find any book and discover AI-powered related recommendations
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleQuickSearch} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by book title, author, or keyword..."
              className="w-full px-6 py-4 pr-32 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent shadow-sm"
              disabled={loading}
              suppressHydrationWarning
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              suppressHydrationWarning
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Quick Search Results (Grid of Books) */}
        {quickResults.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Search Results ({quickResults.length})
              </h2>
              {quickResults.length > 0 && (
                <button
                  onClick={handleDetailedSearch}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition disabled:opacity-50"
                >
                  View Detailed Results with AI Recommendations
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickResults.map((book, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
                  onClick={() => handleBookClick(book.googleBooksId)}
                >
                  {/* Cover Image */}
                  <div className="h-64 bg-gradient-to-br from-purple-100 to-blue-100 relative">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-purple-400" />
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 text-lg">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      by {book.authors.join(', ') || 'Unknown Author'}
                    </p>

                    {/* Rating */}
                    {book.averageRating && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-gray-900">
                            {book.averageRating.toFixed(1)}
                          </span>
                        </div>
                        {book.ratingsCount && (
                          <span className="text-xs text-gray-500">
                            ({book.ratingsCount.toLocaleString()})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Categories */}
                    {book.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {book.categories.slice(0, 2).map((category, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Description Preview */}
                    {book.description && (
                      <p className="text-xs text-gray-600 line-clamp-3">
                        {book.description.replace(/<[^>]*>/g, '')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResult && (
          <div className="space-y-8">
            {/* Main Book */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Book Details</h2>
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Cover Image */}
                  <div className="flex-shrink-0">
                    {searchResult.mainBook.coverImage ? (
                      <img
                        src={searchResult.mainBook.coverImage}
                        alt={searchResult.mainBook.title}
                        className="w-48 h-72 object-cover rounded-lg shadow-md cursor-pointer hover:shadow-xl transition"
                        onClick={() => handleBookClick(searchResult.mainBook.googleBooksId)}
                      />
                    ) : (
                      <div className="w-48 h-72 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-purple-400" />
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="flex-1">
                    <h3 
                      className="text-3xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-purple-600 transition"
                      onClick={() => handleBookClick(searchResult.mainBook.googleBooksId)}
                    >
                      {searchResult.mainBook.title}
                    </h3>
                    
                    <p className="text-lg text-gray-600 mb-4">
                      by {searchResult.mainBook.authors.join(', ') || 'Unknown Author'}
                    </p>

                    {/* Rating */}
                    {searchResult.mainBook.averageRating && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-gray-900">
                            {searchResult.mainBook.averageRating.toFixed(1)}
                          </span>
                        </div>
                        {searchResult.mainBook.ratingsCount && (
                          <span className="text-gray-500">
                            ({searchResult.mainBook.ratingsCount.toLocaleString()} ratings)
                          </span>
                        )}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                      {searchResult.mainBook.publishDate && (
                        <span>📅 {searchResult.mainBook.publishDate}</span>
                      )}
                      {searchResult.mainBook.pageCount && (
                        <span>📖 {searchResult.mainBook.pageCount} pages</span>
                      )}
                    </div>

                    {/* Categories */}
                    {searchResult.mainBook.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {searchResult.mainBook.categories.map((category, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Description */}
                    {searchResult.mainBook.description && (
                      <div className="text-gray-700 leading-relaxed">
                        <p className="line-clamp-4">{searchResult.mainBook.description}</p>
                      </div>
                    )}

                    {/* View Details Button */}
                    <button
                      onClick={() => handleBookClick(searchResult.mainBook.googleBooksId)}
                      className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Books */}
            {searchResult.relatedBooks.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  📚 Related Books You Might Like
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {searchResult.relatedBooks.map((relatedBook, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
                      onClick={() => relatedBook.bookData.googleBooksId && handleBookClick(relatedBook.bookData.googleBooksId)}
                    >
                      {/* Cover */}
                      <div className="mb-3">
                        {relatedBook.bookData.coverImage ? (
                          <img
                            src={relatedBook.bookData.coverImage}
                            alt={relatedBook.bookData.title}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-purple-400" />
                          </div>
                        )}
                      </div>

                      {/* Title & Author */}
                      <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                        {relatedBook.bookData.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        by {relatedBook.bookData.authors?.[0] || relatedBook.author}
                      </p>

                      {/* AI Reason */}
                      <p className="text-xs text-purple-600 bg-purple-50 p-2 rounded">
                        💡 {relatedBook.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !searchResult && !error && (
          <div className="text-center py-16">
            <Search className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Search for any book
            </h3>
            <p className="text-gray-500">
              Enter a book title, author, or keyword to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
