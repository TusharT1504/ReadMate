import axios from 'axios';

class WeatherService {
  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
  }

  /**
   * Get weather by coordinates
   */
  async getWeatherByCoordinates(lat, lon) {
    try {
      if (!this.apiKey) {
        throw new Error('Weather API key not configured');
      }

      const response = await axios.get(this.baseUrl, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return this.mapWeatherData(response.data);
    } catch (error) {
      console.error('Error fetching weather:', error.message);
      throw new Error('Failed to fetch weather data');
    }
  }

  /**
   * Get weather by city name
   */
  async getWeatherByCity(city) {
    try {
      if (!this.apiKey) {
        throw new Error('Weather API key not configured');
      }

      const response = await axios.get(this.baseUrl, {
        params: {
          q: city,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return this.mapWeatherData(response.data);
    } catch (error) {
      console.error('Error fetching weather:', error.message);
      throw new Error('Failed to fetch weather data');
    }
  }

  /**
   * Map OpenWeatherMap data to our app format
   */
  mapWeatherData(data) {
    const weatherMain = data.weather[0].main.toLowerCase();
    const weatherId = data.weather[0].id;
    
    // Map OpenWeatherMap conditions to our app conditions
    let condition = 'sunny';
    
    if (weatherId >= 200 && weatherId < 300) {
      condition = 'stormy'; // Thunderstorm
    } else if (weatherId >= 300 && weatherId < 600) {
      condition = 'rainy'; // Drizzle or Rain
    } else if (weatherId >= 600 && weatherId < 700) {
      condition = 'snowy'; // Snow
    } else if (weatherId >= 801 && weatherId <= 804) {
      condition = 'cloudy'; // Clouds
    } else if (weatherId === 800) {
      condition = 'sunny'; // Clear
    } else {
      // Atmosphere conditions (mist, fog, etc.)
      condition = 'cloudy';
    }

    return {
      condition,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      city: data.name,
      country: data.sys.country,
      icon: data.weather[0].icon,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get current time of day based on hour
   */
  getTimeOfDay(hour = new Date().getHours()) {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }
}

export default new WeatherService();
