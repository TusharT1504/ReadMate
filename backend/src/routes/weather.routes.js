import express from 'express';
import {
  getWeatherByCoordinates,
  getWeatherByCity,
  getTimeOfDay
} from '../controllers/weather.controller.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/coordinates', getWeatherByCoordinates);
router.get('/city', getWeatherByCity);
router.get('/time', getTimeOfDay);

export default router;
