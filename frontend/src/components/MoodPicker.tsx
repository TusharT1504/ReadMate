'use client';

import { useRecommendationStore } from '@/store/recommendationStore';
import { useState } from 'react';
import { Smile, Frown, Map, Lightbulb, Moon, Zap, Heart, AlertCircle, Edit3 } from 'lucide-react';

const MOODS = [
  { value: 'happy', label: 'Happy', icon: Smile, gradient: 'from-yellow-400 to-orange-400' },
  { value: 'sad', label: 'Sad', icon: Frown, gradient: 'from-blue-400 to-cyan-400' },
  { value: 'adventurous', label: 'Adventurous', icon: Map, gradient: 'from-green-400 to-emerald-400' },
  { value: 'reflective', label: 'Reflective', icon: Lightbulb, gradient: 'from-purple-400 to-indigo-400' },
  { value: 'sleepy', label: 'Sleepy', icon: Moon, gradient: 'from-indigo-400 to-blue-400' },
  { value: 'anxious', label: 'Anxious', icon: AlertCircle, gradient: 'from-orange-400 to-red-400' },
  { value: 'energetic', label: 'Energetic', icon: Zap, gradient: 'from-red-400 to-pink-400' },
  { value: 'romantic', label: 'Romantic', icon: Heart, gradient: 'from-pink-400 to-rose-400' },
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
        {MOODS.map((mood) => {
          const Icon = mood.icon;
          return (
            <button
              key={mood.value}
              onClick={() => handleMoodSelect(mood.value)}
              className={`p-2 border rounded-lg transition-all flex flex-col items-center justify-center gap-1 relative overflow-hidden ${
                context.mood === mood.value
                  ? 'border-white/50 ring-2 ring-offset-1 ring-purple-500 shadow-lg text-white'
                  : 'bg-white/80 border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm hover:scale-105'
              }`}
              title={mood.label}
            >
              {context.mood === mood.value && (
                <div className={`absolute inset-0 bg-gradient-to-br ${mood.gradient} opacity-100`} />
              )}
              {context.mood !== mood.value && (
                <div className={`absolute inset-0 bg-gradient-to-br ${mood.gradient} opacity-10`} />
              )}
              <Icon className="w-5 h-5 relative z-10" />
              <div className="text-[10px] font-medium truncate w-full text-center relative z-10">{mood.label}</div>
            </button>
          );
        })}
      </div>

      {/* Custom Mood Input */}
      {!showCustom ? (
        <button
          onClick={() => setShowCustom(true)}
          className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-gray-400 hover:text-gray-700 transition flex items-center justify-center gap-2"
        >
          <Edit3 className="w-3.5 h-3.5" /> Describe your own mood
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
