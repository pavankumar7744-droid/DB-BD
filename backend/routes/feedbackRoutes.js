import express from 'express';
import { getFeedbackHistory, getFeedbackById } from '../controllers/feedbackController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getFeedbackHistory);
router.get('/:id', protect, getFeedbackById);

export default router;
