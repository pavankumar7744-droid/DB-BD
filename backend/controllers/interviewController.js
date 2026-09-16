import InterviewSession from '../models/InterviewSession.js';
import Question from '../models/Question.js';
import Feedback from '../models/Feedback.js';
import { generateFeedback } from '../services/aiService.js';

// @desc    Start a new interview session
// @route   POST /api/interviews/start
// @access  Private
export const startInterview = async (req, res) => {
  try {
    const { category = 'Mixed', role = 'General', numQuestions = 5, proctoringEnabled = false } = req.body;

    const limit = Math.min(Math.max(parseInt(numQuestions, 10) || 5, 1), 10);
    const matchStage = {};

    if (category && category !== 'Mixed') {
      matchStage.category = category;
    }
    if (role && role !== 'All' && role !== 'General') {
      matchStage.role = { $in: [role, 'General'] };
    }

    const pipeline = [];
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
    pipeline.push({ $sample: { size: limit } });

    let sampledQuestions = await Question.aggregate(pipeline);

    if (sampledQuestions.length < limit) {
      sampledQuestions = await Question.aggregate([{ $sample: { size: limit } }]);
    }

    const initialAnswers = sampledQuestions.map((q) => ({
      question: q._id,
      userAnswer: '',
      responseTimeSeconds: 0,
    }));

    const session = await InterviewSession.create({
      user: req.user._id,
      category,
      role,
      status: 'in-progress',
      answers: initialAnswers,
      proctoring: {
        enabled: Boolean(proctoringEnabled),
        proctorScore: 100,
        faceInFramePercent: 100,
        eyeContactPercent: 100,
        warningCount: 0,
        flags: [],
      },
      startedAt: new Date(),
    });

    const populatedSession = await InterviewSession.findById(session._id).populate('answers.question');

    res.status(201).json(populatedSession);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user interview history
// @route   GET /api/interviews
// @access  Private
export const getInterviews = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('answers.question');
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single interview session by ID
// @route   GET /api/interviews/:sessionId
// @access  Private
export const getInterviewById = async (req, res) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.sessionId,
      user: req.user._id,
    })
      .populate('answers.question')
      .populate({
        path: 'answers.feedback',
        model: 'Feedback',
      });

    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit answer for a question in a session
// @route   POST /api/interviews/:sessionId/answer
// @access  Private
export const answerQuestion = async (req, res) => {
  try {
    const { questionId, userAnswer, responseTimeSeconds = 0 } = req.body;
    const { sessionId } = req.params;

    const session = await InterviewSession.findOne({
      _id: sessionId,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Call AI feedback service
    const feedbackData = await generateFeedback(question, userAnswer);

    // Save Feedback document
    const feedback = await Feedback.create({
      session: session._id,
      question: question._id,
      user: req.user._id,
      scores: feedbackData.scores,
      strengths: feedbackData.strengths,
      weaknesses: feedbackData.weaknesses,
      suggestions: feedbackData.suggestions,
      improvedAnswerExample: feedbackData.improvedAnswerExample,
      rawModelOutput: feedbackData.rawModelOutput,
    });

    // Update answer entry in interview session
    const answerIndex = session.answers.findIndex(
      (ans) => ans.question.toString() === questionId
    );

    if (answerIndex !== -1) {
      session.answers[answerIndex].userAnswer = userAnswer;
      session.answers[answerIndex].responseTimeSeconds = responseTimeSeconds;
      session.answers[answerIndex].feedback = feedback._id;
    } else {
      session.answers.push({
        question: question._id,
        userAnswer,
        responseTimeSeconds,
        feedback: feedback._id,
      });
    }

    await session.save();

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete interview session & calculate overall score
// @route   PUT /api/interviews/:sessionId/complete
// @access  Private
export const completeInterview = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { proctoringData } = req.body || {};

    const session = await InterviewSession.findOne({
      _id: sessionId,
      user: req.user._id,
    }).populate('answers.feedback');

    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    // Collect all feedbacks from answers
    const feedbacks = session.answers
      .map((ans) => ans.feedback)
      .filter(Boolean);

    if (feedbacks.length > 0) {
      const sumOverall = feedbacks.reduce(
        (acc, fb) => acc + (fb.scores?.overall || 0),
        0
      );
      const avgOverallTenScale = sumOverall / feedbacks.length;
      session.overallScore = Math.round(avgOverallTenScale * 10);
    } else {
      session.overallScore = 0;
    }

    if (proctoringData && session.proctoring?.enabled) {
      session.proctoring.proctorScore = proctoringData.proctorScore ?? 100;
      session.proctoring.faceInFramePercent = proctoringData.faceInFramePercent ?? 100;
      session.proctoring.eyeContactPercent = proctoringData.eyeContactPercent ?? 100;
      session.proctoring.warningCount = proctoringData.warningCount ?? 0;
      session.proctoring.flags = Array.isArray(proctoringData.flags) ? proctoringData.flags : [];
    }

    session.status = 'completed';
    session.completedAt = new Date();
    await session.save();

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
