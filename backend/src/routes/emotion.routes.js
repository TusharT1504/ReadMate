import express from 'express';
import multer from 'multer';
import { detectEmotion, getStatus } from '../controllers/emotion.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for image upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// @route   POST /api/emotion/detect
// @desc    Detect emotion from image
// @access  Private
router.post('/detect', protect, upload.single('image'), detectEmotion);

// @route   GET /api/emotion/status
// @desc    Check emotion detection service status
// @access  Public
router.get('/status', getStatus);

export default router;
