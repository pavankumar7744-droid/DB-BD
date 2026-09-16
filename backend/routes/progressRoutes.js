import express from 'express';
import { getProgressStats } from '../controllers/progressController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getProgressStats);

export default router;
