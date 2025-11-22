import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  getLikedSections, 
  addLikedSection,
  getHistory,
  updatePreferences,
  addFavorite,
  removeFavorite,
  getFavorites
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/me', getProfile);
router.put('/me', updateProfile);
router.get('/me/likes', getLikedSections);
router.post('/me/like-section', addLikedSection);
router.get('/me/history', getHistory);
router.put('/me/preferences', updatePreferences);

router.get('/me/favorites', getFavorites);
router.post('/me/favorites', addFavorite);
router.delete('/me/favorites/:bookId', removeFavorite);

export default router;
