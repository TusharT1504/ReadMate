'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import Navigation from '@/components/Navigation';
import { format } from 'date-fns';
import { BookOpen, Star } from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reads' | 'recommendations' | 'moods'>('reads');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchHistory();
  }, [isAuthenticated]);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/users/me/history');
      setHistory(response.data.data.history);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">History</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('reads')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'reads'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📚 Past Reads ({history?.pastReads?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'recommendations'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ✨ Recommendations ({history?.recommendations?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('moods')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'moods'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🎭 Mood History ({history?.moodHistory?.length || 0})
          </button>
        </div>

        {/* Past Reads */}
        {activeTab === 'reads' && (
          <div className="space-y-4">
            {history?.pastReads && history.pastReads.length > 0 ? (
              history.pastReads.map((read: any) => (
                <div
                  key={read._id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3
                        className="text-xl font-semibold text-gray-900 mb-1 cursor-pointer hover:text-purple-600"
                        onClick={() =>
                          router.push(`/book/${read.bookId?._id || read.bookId}`)
                        }
                      >
                        {read.bookId?.title || 'Unknown Book'}
                      </h3>
                      <p className="text-gray-600">
                        by {read.bookId?.authors?.join(', ') || 'Unknown Author'}
                      </p>
                    </div>
                    {read.rating && (
                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-lg">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-medium">{read.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Started:</span>{' '}
                      {format(new Date(read.startedAt), 'MMM d, yyyy')}
                    </div>
                    {read.finishedAt && (
                      <div>
                        <span className="font-medium">Finished:</span>{' '}
                        {format(new Date(read.finishedAt), 'MMM d, yyyy')}
                      </div>
                    )}
                    {!read.finishedAt && (
                      <div className="text-blue-600 font-medium">📖 Currently Reading</div>
                    )}
                  </div>

                  {read.review && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 italic">"{read.review}"</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No reading history yet
                </h3>
                <p className="text-gray-500">
                  Start reading and your books will appear here
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            {history?.recommendations && history.recommendations.length > 0 ? (
              history.recommendations.map((log: any) => (
                <div
                  key={log._id}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Recommendation Session
                      </h3>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>📅 {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}</span>
                        {log.context.mood && (
                          <span>🎭 {log.context.mood}</span>
                        )}
                        {log.context.timeOfDay && (
                          <span>🕐 {log.context.timeOfDay}</span>
                        )}
                        {log.context.weather && (
                          <span>🌤️ {log.context.weather}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {log.recommendations.map((rec: any, index: number) => {
                      // Handle both database books and AI-generated external books
                      const title = rec.bookId?.title || rec.externalData?.title || 'Unknown Book';
                      const authors = rec.bookId?.authors || rec.externalData?.authors || [];
                      const authorString = authors.length > 0 ? authors.join(', ') : 'Unknown Author';
                      const coverImage = rec.bookId?.metadata?.coverImage || rec.externalData?.coverImage;
                      const bookLink = rec.bookId?._id 
                        ? `/book/${rec.bookId._id}` 
                        : rec.externalData?.googleBooksId 
                          ? `/book-external/${rec.externalData.googleBooksId}`
                          : '#';

                      return (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition cursor-pointer"
                          onClick={() => bookLink !== '#' && router.push(bookLink)}
                        >
                          <div className="flex gap-4">
                            {/* Book Cover */}
                            <div className="flex-shrink-0">
                              {coverImage ? (
                                <img
                                  src={coverImage}
                                  alt={title}
                                  className="w-20 h-28 object-cover rounded-lg shadow"
                                />
                              ) : (
                                <div className="w-20 h-28 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                                  <BookOpen className="w-8 h-8 text-purple-400" />
                                </div>
                              )}
                            </div>

                            {/* Rank Badge */}
                            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                              #{rec.rank}
                            </div>

                            {/* Book Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {title}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                by {authorString}
                              </p>
                              {rec.why && (
                                <p className="text-sm text-purple-700 bg-purple-50 px-3 py-2 rounded-lg">
                                  💡 {rec.why}
                                </p>
                              )}
                              {rec.source === 'ai-google-books' && (
                                <div className="mt-2 inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                  <span>✨</span>
                                  <span>AI Recommended</span>
                                </div>
                              )}
                            </div>

                            {/* Score */}
                            <div className="text-right text-sm flex-shrink-0">
                              <div className="text-gray-500 mb-1">Match</div>
                              <div className="font-bold text-purple-600 text-lg">
                                {(rec.score * 100).toFixed(0)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">✨</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No recommendation history yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Get your first personalized recommendations
                </p>
                <button
                  onClick={() => router.push('/discover')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Discover Books
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mood History */}
        {activeTab === 'moods' && (
          <div className="space-y-3">
            {history?.moodHistory && history.moodHistory.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="space-y-3">
                  {history.moodHistory.map((mood: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🎭</span>
                        <span className="font-medium text-gray-900 capitalize">
                          {mood.mood}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(mood.at), 'MMM d, yyyy HH:mm')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🎭</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No mood history yet
                </h3>
                <p className="text-gray-500">
                  Your mood selections will be tracked here
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
