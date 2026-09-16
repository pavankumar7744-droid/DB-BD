import express from 'express';
import { getQuestions, getMetaFilters } from '../controllers/questionController.js';

const router = express.Router();

router.get('/', getQuestions);
router.get('/meta/filters', getMetaFilters);

export default router;
