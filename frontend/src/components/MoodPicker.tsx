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
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-gray-900">
          How are you feeling?
        </h2>
        {context.mood && (
          <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
            Current: {context.mood}
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-3">
        {MOODS.map((mood) => (
          <button
            key={mood.value}
            onClick={() => handleMoodSelect(mood.value)}
            className={`p-2 border rounded-lg transition-all flex flex-col items-center justify-center gap-1 ${
              context.mood === mood.value
                ? mood.color + ' border-opacity-100 ring-1 ring-offset-1 ring-purple-500'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
            }`}
            title={mood.label}
          >
            <div className="text-xl">{mood.emoji}</div>
            <div className="text-[10px] font-medium truncate w-full text-center">{mood.label}</div>
          </button>
        ))}
      </div>

      {/* Custom Mood Input */}
      {!showCustom ? (
        <button
          onClick={() => setShowCustom(true)}
          className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-gray-400 hover:text-gray-700 transition flex items-center justify-center gap-2"
        >
          <span>✍️</span> Describe your own mood
        </button>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={customMood}
            onChange={(e) => setCustomMood(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCustomMood()}
            placeholder="e.g., curious..."
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-600 focus:border-transparent"
            autoFocus
          />
          <button
            onClick={handleCustomMood}
            disabled={!customMood.trim()}
            className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 transition disabled:opacity-50"
          >
            Set
          </button>
          <button
            onClick={() => {
              setShowCustom(false);
              setCustomMood('');
            }}
            className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-md hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
