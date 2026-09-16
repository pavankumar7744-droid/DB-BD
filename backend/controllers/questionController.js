import Question from '../models/Question.js';

// @desc    Get sample questions by filter
// @route   GET /api/questions
// @access  Public
export const getQuestions = async (req, res) => {
  try {
    const { category, role, difficulty, limit = 5 } = req.query;
    const matchStage = {};

    if (category && category !== 'Mixed') {
      matchStage.category = category;
    }
    if (role && role !== 'All' && role !== 'General') {
      matchStage.role = { $in: [role, 'General'] };
    }
    if (difficulty && difficulty !== 'All') {
      matchStage.difficulty = difficulty;
    }

    const sampleSize = parseInt(limit, 10) || 5;

    const pipeline = [];
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
    pipeline.push({ $sample: { size: sampleSize } });

    let questions = await Question.aggregate(pipeline);

    // Fallback if filter returned fewer than requested questions
    if (questions.length === 0) {
      questions = await Question.aggregate([{ $sample: { size: sampleSize } }]);
    }

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get metadata filters (distinct categories and roles)
// @route   GET /api/questions/meta/filters
// @access  Public
export const getMetaFilters = async (req, res) => {
  try {
    const categories = ['Technical', 'Behavioral', 'HR', 'System Design', 'Mixed'];
    const roles = await Question.distinct('role');
    const difficulties = ['Easy', 'Medium', 'Hard'];

    const filteredRoles = Array.from(new Set(['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', ...roles]));

    res.json({
      categories,
      roles: filteredRoles,
      difficulties,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
