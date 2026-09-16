import express from 'express';
import {
  startInterview,
  getInterviews,
  getInterviewById,
  answerQuestion,
  completeInterview,
} from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/start', protect, startInterview);
router.get('/', protect, getInterviews);
router.get('/:sessionId', protect, getInterviewById);
router.post('/:sessionId/answer', protect, answerQuestion);
router.put('/:sessionId/complete', protect, completeInterview);

export default router;
