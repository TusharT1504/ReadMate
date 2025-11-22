'use client';

import { useRecommendationStore } from '@/store/recommendationStore';
import { useEffect, useState } from 'react';
import { Sunrise, Sun, Sunset, Moon, CloudSun, Cloud, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';
import api from '@/lib/api';

const TIME_OPTIONS = [
  { value: 'morning', label: 'Morning', icon: Sunrise, gradient: 'from-orange-400 to-yellow-400' },
  { value: 'afternoon', label: 'Afternoon', icon: Sun, gradient: 'from-yellow-400 to-orange-400' },
  { value: 'evening', label: 'Evening', icon: Sunset, gradient: 'from-orange-400 to-pink-400' },
  { value: 'night', label: 'Night', icon: Moon, gradient: 'from-indigo-400 to-purple-400' },
];

const WEATHER_OPTIONS = [
  { value: 'sunny', label: 'Sunny', icon: Sun, gradient: 'from-yellow-400 to-orange-400' },
  { value: 'cloudy', label: 'Cloudy', icon: Cloud, gradient: 'from-gray-400 to-slate-400' },
  { value: 'rainy', label: 'Rainy', icon: CloudRain, gradient: 'from-blue-400 to-cyan-400' },
  { value: 'snowy', label: 'Snowy', icon: CloudSnow, gradient: 'from-cyan-400 to-blue-400' },
  { value: 'stormy', label: 'Stormy', icon: CloudLightning, gradient: 'from-purple-400 to-indigo-400' },
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
    <div className="bg-white rounded-xl shadow-sm p-4 h-full">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Context</h2>

      {/* Time Selection */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-medium text-gray-500">Time of Day</label>
          {autoDetected.time && (
            <span className="text-[10px] text-green-600 flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded-full">
              ✓ Auto
            </span>
          )}
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {TIME_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => handleTimeChange(option.value)}
                className={`py-1.5 px-1 rounded-md text-xs transition-all flex flex-col items-center gap-1 border relative overflow-hidden ${
                  context.timeOfDay === option.value
                    ? 'border-white/50 ring-2 ring-offset-1 ring-purple-500 shadow-md text-white'
                    : 'bg-white/80 border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm hover:scale-105'
                }`}
              >
                {context.timeOfDay === option.value && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-100`} />
                )}
                {context.timeOfDay !== option.value && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-10`} />
                )}
                <Icon className="w-4 h-4 relative z-10" />
                <span className="text-[10px] relative z-10">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Weather Selection */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-medium text-gray-500">Weather</label>
          <div className="flex items-center gap-2">
            {autoDetected.weather && (
              <span className="text-[10px] text-green-600 flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded-full">
                ✓ {weatherInfo?.city || 'Detected'}
              </span>
            )}
            {weatherInfo && (
              <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                {weatherInfo.temperature}°C
              </span>
            )}
          </div>
        </div>
        
        {isLoadingWeather ? (
          <div className="text-xs text-gray-400 py-2 text-center">Detecting weather...</div>
        ) : (
          <div className="grid grid-cols-5 gap-1">
            {WEATHER_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleWeatherChange(option.value)}
                  className={`py-1.5 px-1 rounded-md text-xs transition-all flex flex-col items-center gap-1 border relative overflow-hidden ${
                    context.weather === option.value
                      ? 'border-white/50 ring-2 ring-offset-1 ring-blue-500 shadow-md text-white'
                      : 'bg-white/80 border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm hover:scale-105'
                  }`}
                  title={option.label}
                >
                  {context.weather === option.value && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-100`} />
                  )}
                  {context.weather !== option.value && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-10`} />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="text-[10px] font-medium relative z-10">{option.label}</span>
                </button>
              );
            })}
          </div>
        )}
        
        {error && (
          <div className="mt-2 text-[10px] text-red-500 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setWeather('')} className="underline">Clear</button>
          </div>
        )}
      </div>
    </div>
  );
}
