import weatherService from '../services/weather.service.js';

/**
 * Get weather by coordinates
 */
export const getWeatherByCoordinates = async (req, res, next) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const weather = await weatherService.getWeatherByCoordinates(
      parseFloat(lat),
      parseFloat(lon)
    );

    res.json({
      success: true,
      data: weather
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get weather by city name
 */
export const getWeatherByCity = async (req, res, next) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'City name is required'
      });
    }

    const weather = await weatherService.getWeatherByCity(city);

    res.json({
      success: true,
      data: weather
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current time of day
 */
export const getTimeOfDay = async (req, res, next) => {
  try {
    const { hour } = req.query;
    const timeOfDay = weatherService.getTimeOfDay(hour ? parseInt(hour) : undefined);

    res.json({
      success: true,
      data: {
        timeOfDay,
        currentHour: new Date().getHours(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};
