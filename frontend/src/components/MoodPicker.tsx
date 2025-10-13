'use client';

import { useRecommendationStore } from '@/store/recommendationStore';
import { useState } from 'react';

const MOODS = [
  { value: 'happy', label: 'Happy', emoji: '😊', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
  { value: 'sad', label: 'Sad', emoji: '😢', color: 'bg-blue-100 border-blue-300 text-blue-700' },
  { value: 'adventurous', label: 'Adventurous', emoji: '🗺️', color: 'bg-green-100 border-green-300 text-green-700' },
  { value: 'reflective', label: 'Reflective', emoji: '🤔', color: 'bg-purple-100 border-purple-300 text-purple-700' },
  { value: 'sleepy', label: 'Sleepy', emoji: '😴', color: 'bg-indigo-100 border-indigo-300 text-indigo-700' },
  { value: 'anxious', label: 'Anxious', emoji: '😰', color: 'bg-orange-100 border-orange-300 text-orange-700' },
  { value: 'energetic', label: 'Energetic', emoji: '⚡', color: 'bg-red-100 border-red-300 text-red-700' },
  { value: 'romantic', label: 'Romantic', emoji: '❤️', color: 'bg-pink-100 border-pink-300 text-pink-700' },
];

export default function MoodPicker() {
  const { context, setMood } = useRecommendationStore();
  const [customMood, setCustomMood] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleMoodSelect = (mood: string) => {
    setMood(mood);
    setShowCustom(false);
    setCustomMood('');
  };

  const handleCustomMood = () => {
    if (customMood.trim()) {
      setMood(customMood.trim());
      setShowCustom(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        How are you feeling?
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {MOODS.map((mood) => (
          <button
            key={mood.value}
            onClick={() => handleMoodSelect(mood.value)}
            className={`p-4 border-2 rounded-lg transition-all ${
              context.mood === mood.value
                ? mood.color + ' border-opacity-100'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl mb-2">{mood.emoji}</div>
            <div className="text-sm font-medium">{mood.label}</div>
          </button>
        ))}
      </div>

      {/* Custom Mood Input */}
      {!showCustom ? (
        <button
          onClick={() => setShowCustom(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition"
        >
          ✍️ Describe your own mood
        </button>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={customMood}
            onChange={(e) => setCustomMood(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCustomMood()}
            placeholder="e.g., curious, nostalgic, motivated..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            autoFocus
          />
          <button
            onClick={handleCustomMood}
            disabled={!customMood.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Set
          </button>
          <button
            onClick={() => {
              setShowCustom(false);
              setCustomMood('');
            }}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>
      )}

      {context.mood && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-700">
            <span className="font-medium">Current mood:</span> {context.mood}
          </p>
        </div>
      )}
    </div>
  );
}
