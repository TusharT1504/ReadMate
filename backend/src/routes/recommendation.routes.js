import express from 'express';
import { generateRecommendations, getRecommendationHistory } from '../controllers/recommendation.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.use(protect);

router.post('/generate', generateRecommendations);
router.get('/history', getRecommendationHistory);

export default router;
