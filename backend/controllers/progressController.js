import InterviewSession from '../models/InterviewSession.js';
import Feedback from '../models/Feedback.js';

// @desc    Get user progress analytics and weakness statistics
// @route   GET /api/progress
// @access  Private
export const getProgressStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Completed sessions
    const completedSessions = await InterviewSession.find({
      user: userId,
      status: 'completed',
    }).sort({ completedAt: 1 });

    const totalSessions = completedSessions.length;

    // Score trend array
    const scoreTrend = completedSessions.map((session) => ({
      sessionId: session._id,
      date: session.completedAt || session.updatedAt,
      category: session.category,
      role: session.role,
      overallScore: session.overallScore || 0,
    }));

    // Calculate dimension averages from all feedback records
    const allFeedbacks = await Feedback.find({ user: userId });

    let avgScores = {
      relevance: 0,
      clarity: 0,
      confidence: 0,
      communication: 0,
      overall: 0,
    };

    if (allFeedbacks.length > 0) {
      const sums = allFeedbacks.reduce(
        (acc, fb) => {
          acc.relevance += fb.scores?.relevance || 0;
          acc.clarity += fb.scores?.clarity || 0;
          acc.confidence += fb.scores?.confidence || 0;
          acc.communication += fb.scores?.communication || 0;
          acc.overall += fb.scores?.overall || 0;
          return acc;
        },
        { relevance: 0, clarity: 0, confidence: 0, communication: 0, overall: 0 }
      );

      const count = allFeedbacks.length;
      avgScores = {
        relevance: Number((sums.relevance / count).toFixed(1)),
        clarity: Number((sums.clarity / count).toFixed(1)),
        confidence: Number((sums.confidence / count).toFixed(1)),
        communication: Number((sums.communication / count).toFixed(1)),
        overall: Number((sums.overall / count).toFixed(1)),
      };
    }

    // Aggregate recurring weaknesses
    const weaknessCounts = {};
    allFeedbacks.forEach((fb) => {
      if (Array.isArray(fb.weaknesses)) {
        fb.weaknesses.forEach((weakness) => {
          const cleanWeakness = weakness.trim();
          if (cleanWeakness) {
            weaknessCounts[cleanWeakness] = (weaknessCounts[cleanWeakness] || 0) + 1;
          }
        });
      }
    });

    const sortedWeaknesses = Object.entries(weaknessCounts)
      .map(([weakness, count]) => ({ weakness, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      totalSessions,
      scoreTrend,
      avgScores,
      recurringWeaknesses: sortedWeaknesses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
