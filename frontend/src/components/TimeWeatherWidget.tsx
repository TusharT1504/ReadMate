'use client';

import { useRecommendationStore } from '@/store/recommendationStore';
import { useEffect } from 'react';

const TIME_OPTIONS = [
  { value: 'morning', label: 'Morning', emoji: '🌅' },
  { value: 'afternoon', label: 'Afternoon', emoji: '☀️' },
  { value: 'evening', label: 'Evening', emoji: '🌆' },
  { value: 'night', label: 'Night', emoji: '🌙' },
];

const WEATHER_OPTIONS = [
  { value: 'sunny', label: 'Sunny', emoji: '☀️' },
  { value: 'cloudy', label: 'Cloudy', emoji: '☁️' },
  { value: 'rainy', label: 'Rainy', emoji: '🌧️' },
  { value: 'snowy', label: 'Snowy', emoji: '❄️' },
  { value: 'stormy', label: 'Stormy', emoji: '⛈️' },
];

export default function TimeWeatherWidget() {
  const { context, setTimeOfDay, setWeather } = useRecommendationStore();

  useEffect(() => {
    // Auto-detect time of day on mount
    const hour = new Date().getHours();
    let timeOfDay = 'morning';
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';
    
    setTimeOfDay(timeOfDay);
  }, [setTimeOfDay]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Context
      </h2>

      {/* Time of Day */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time of Day
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TIME_OPTIONS.map((time) => (
            <button
              key={time.value}
              onClick={() => setTimeOfDay(time.value)}
              className={`p-3 border-2 rounded-lg transition ${
                context.timeOfDay === time.value
                  ? 'bg-purple-100 border-purple-300 text-purple-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="text-xl mb-1">{time.emoji}</div>
              <div className="text-xs font-medium">{time.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Weather */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Weather (Optional)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {WEATHER_OPTIONS.map((weather) => (
            <button
              key={weather.value}
              onClick={() => setWeather(weather.value)}
              className={`p-3 border-2 rounded-lg transition ${
                context.weather === weather.value
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="text-xl mb-1">{weather.emoji}</div>
              <div className="text-xs font-medium">{weather.label}</div>
            </button>
          ))}
        </div>
        {context.weather && (
          <button
            onClick={() => setWeather('')}
            className="w-full mt-2 py-2 text-sm text-gray-600 hover:text-gray-800 transition"
          >
            Clear weather
          </button>
        )}
      </div>
    </div>
  );
}
