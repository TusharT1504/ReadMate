'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import Navigation from '@/components/Navigation';

const GENRE_OPTIONS = [
  'fiction', 'non-fiction', 'science fiction', 'fantasy', 'mystery', 'thriller',
  'romance', 'horror', 'biography', 'history', 'self-help', 'business',
  'poetry', 'drama', 'comedy', 'adventure', 'philosophy', 'psychology'
];

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    dob: user?.dob || '',
    gender: user?.gender || '',
  });

  const [preferences, setPreferences] = useState({
    favoriteGenres: user?.preferences?.favoriteGenres || [],
    dislikedGenres: user?.preferences?.dislikedGenres || [],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.put('/users/me', profileData);
      
      // Update auth store with new user data
      if (user) {
        setAuth({ ...user, ...response.data.data.user });
      }

      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await api.put('/users/me/preferences', preferences);
      setMessage('Preferences updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavoriteGenre = (genre: string) => {
    setPreferences((prev) => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter((g: string) => g !== genre)
        : [...prev.favoriteGenres, genre],
    }));
  };

  const toggleDislikedGenre = (genre: string) => {
    setPreferences((prev) => ({
      ...prev,
      dislikedGenres: prev.dislikedGenres.includes(genre)
        ? prev.dislikedGenres.filter((g: string) => g !== genre)
        : [...prev.dislikedGenres, genre],
    }));
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Profile</h1>

        {message && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Basic Information
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={profileData.dob ? profileData.dob.split('T')[0] : ''}
                onChange={(e) =>
                  setProfileData({ ...profileData, dob: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                value={profileData.gender}
                onChange={(e) =>
                  setProfileData({ ...profileData, gender: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Reading Preferences */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Reading Preferences
          </h2>

          <form onSubmit={handleUpdatePreferences} className="space-y-6">
            {/* Favorite Genres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Favorite Genres
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {GENRE_OPTIONS.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleFavoriteGenre(genre)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      preferences.favoriteGenres.includes(genre)
                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
                    }`}
                  >
                    {preferences.favoriteGenres.includes(genre) ? '✓ ' : ''}
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Disliked Genres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Disliked Genres
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {GENRE_OPTIONS.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleDislikedGenre(genre)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      preferences.dislikedGenres.includes(genre)
                        ? 'bg-red-100 text-red-700 border-2 border-red-300'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
                    }`}
                  >
                    {preferences.dislikedGenres.includes(genre) ? '✗ ' : ''}
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Preferences'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
