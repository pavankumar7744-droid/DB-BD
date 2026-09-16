import Feedback from '../models/Feedback.js';

// @desc    Get user's feedback history
// @route   GET /api/feedback
// @access  Private
export const getFeedbackHistory = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('question')
      .populate('session');
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single feedback by ID
// @route   GET /api/feedback/:id
// @access  Private
export const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate('question')
      .populate('session');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback record not found' });
    }

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
