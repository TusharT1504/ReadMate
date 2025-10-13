'use client';

import { useRecommendationStore } from '@/store/recommendationStore';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

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
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherInfo, setWeatherInfo] = useState<any>(null);
  const [autoDetected, setAutoDetected] = useState({ time: false, weather: false });
  const [error, setError] = useState('');

  // Auto-detect time of day on mount
  useEffect(() => {
    const hour = new Date().getHours();
    let timeOfDay = 'morning';
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';
    
    setTimeOfDay(timeOfDay);
    setAutoDetected(prev => ({ ...prev, time: true }));
  }, [setTimeOfDay]);

  // Auto-detect weather on mount
  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoadingWeather(true);
      setError('');

      try {
        // Get user's geolocation
        if (!navigator.geolocation) {
          setError('Geolocation not supported');
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const response = await api.get('/weather/coordinates', {
                params: { lat: latitude, lon: longitude }
              });

              const weather = response.data.data;
              setWeatherInfo(weather);
              setWeather(weather.condition);
              setAutoDetected(prev => ({ ...prev, weather: true }));
            } catch (err: any) {
              console.error('Error fetching weather:', err);
              setError('Unable to fetch weather');
            } finally {
              setIsLoadingWeather(false);
            }
          },
          (err) => {
            console.error('Geolocation error:', err);
            setError('Location access denied');
            setIsLoadingWeather(false);
          }
        );
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to detect weather');
        setIsLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [setWeather]);

  const handleTimeChange = (value: string) => {
    setTimeOfDay(value);
    setAutoDetected(prev => ({ ...prev, time: false }));
  };

  const handleWeatherChange = (value: string) => {
    setWeather(value);
    setAutoDetected(prev => ({ ...prev, weather: false }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Context
      </h2>

      {/* Time of Day */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Time of Day
          </label>
          {autoDetected.time && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Auto-detected
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {TIME_OPTIONS.map((time) => (
            <button
              key={time.value}
              onClick={() => handleTimeChange(time.value)}
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
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Weather
          </label>
          {autoDetected.weather && weatherInfo && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              {weatherInfo.city}
            </span>
          )}
        </div>

        {isLoadingWeather ? (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Detecting weather...
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
                {error} - Please select manually
              </div>
            )}
            {weatherInfo && (
              <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{weatherInfo.description}</span>
                  <span className="font-semibold text-blue-700">{weatherInfo.temperature}°C</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {WEATHER_OPTIONS.map((weather) => (
                <button
                  key={weather.value}
                  onClick={() => handleWeatherChange(weather.value)}
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
                onClick={() => {
                  setWeather('');
                  setAutoDetected(prev => ({ ...prev, weather: false }));
                }}
                className="w-full mt-2 py-2 text-sm text-gray-600 hover:text-gray-800 transition"
              >
                Clear weather
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
