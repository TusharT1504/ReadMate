import axios from 'axios';

export const getTimeOfDay = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

export const getWeatherInfo = async (lat, lon) => {
  try {
    if (!process.env.WEATHER_API_KEY) {
      return 'unknown';
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}`
    );

    const weather = response.data.weather[0].main.toLowerCase();
    
    // Simplify weather conditions
    if (weather.includes('rain')) return 'rainy';
    if (weather.includes('cloud')) return 'cloudy';
    if (weather.includes('clear') || weather.includes('sun')) return 'sunny';
    if (weather.includes('snow')) return 'snowy';
    
    return weather;
  } catch (error) {
    console.error('Error fetching weather:', error.message);
    return 'unknown';
  }
};
