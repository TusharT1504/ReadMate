'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { ArrowLeft, Star, BookOpen, ExternalLink, Loader2 } from 'lucide-react';
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
  publisher?: string;
  isbn?: string;
  language?: string;
  previewLink?: string;
  infoLink?: string;
}

interface RelatedBook {
  title: string;
  author: string;
  reason: string;
  bookData: Book;
}

export default function GoogleBookDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<RelatedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBook();
  }, [params.id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/search/books/${params.id}`);
      setBook(response.data.data.book);
      
      // Fetch related books
      fetchRelatedBooks(params.id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBooks = async (bookId: string) => {
    try {
      setLoadingRelated(true);
      const response = await api.get(`/search/books/${bookId}/related`);
      setRelatedBooks(response.data.data.relatedBooks);
    } catch (err) {
      console.error('Failed to load related books:', err);
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleBookClick = (bookId: string) => {
    router.push(`/book/${bookId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading book details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-6 py-8">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            {error || 'Book not found'}
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 text-purple-600 hover:text-purple-700 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 text-purple-600 hover:text-purple-700 flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Book Details */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cover Image */}
              <div className="flex-shrink-0">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-64 h-96 object-cover rounded-lg shadow-xl"
                  />
                ) : (
                  <div className="w-64 h-96 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-24 h-24 text-purple-400" />
                  </div>
                )}
              </div>

              {/* Book Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  {book.title}
                </h1>
                
                <p className="text-xl text-gray-600 mb-6">
                  by {book.authors.join(', ') || 'Unknown Author'}
                </p>

                {/* Rating */}
                {book.averageRating && (
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-2">
                      <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                      <span className="text-2xl font-bold text-gray-900">
                        {book.averageRating.toFixed(1)}
                      </span>
                    </div>
                    {book.ratingsCount && (
                      <span className="text-gray-500">
                        ({book.ratingsCount.toLocaleString()} ratings)
                      </span>
                    )}
                  </div>
                )}

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {book.publishDate && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Published</p>
                      <p className="font-semibold text-gray-900">{book.publishDate}</p>
                    </div>
                  )}
                  {book.pageCount && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Pages</p>
                      <p className="font-semibold text-gray-900">{book.pageCount}</p>
                    </div>
                  )}
                  {book.publisher && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Publisher</p>
                      <p className="font-semibold text-gray-900">{book.publisher}</p>
                    </div>
                  )}
                  {book.language && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Language</p>
                      <p className="font-semibold text-gray-900">{book.language.toUpperCase()}</p>
                    </div>
                  )}
                </div>

                {/* Categories */}
                {book.categories.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2">Genres</p>
                    <div className="flex flex-wrap gap-2">
                      {book.categories.map((category, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* External Links */}
                <div className="flex flex-wrap gap-3">
                  {book.previewLink && (
                    <a
                      href={book.previewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                    >
                      <BookOpen className="w-5 h-5" />
                      Preview Book
                    </a>
                  )}
                  {book.infoLink && (
                    <a
                      href={book.infoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition flex items-center gap-2"
                    >
                      <ExternalLink className="w-5 h-5" />
                      More Info
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {book.description && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About this book</h2>
                <div 
                  className="text-gray-700 leading-relaxed prose prose-purple max-w-none"
                  dangerouslySetInnerHTML={{ __html: book.description }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Related Books */}
        {loadingRelated ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mr-3" />
              <p className="text-gray-600">Finding related books...</p>
            </div>
          </div>
        ) : relatedBooks.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              📚 Related Books You Might Like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedBooks.map((relatedBook, index) => (
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
        ) : null}
      </div>
    </div>
  );
}
