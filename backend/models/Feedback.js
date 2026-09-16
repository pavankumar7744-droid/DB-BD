import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewSession',
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scores: {
      relevance: { type: Number, min: 0, max: 10, default: 5 },
      clarity: { type: Number, min: 0, max: 10, default: 5 },
      confidence: { type: Number, min: 0, max: 10, default: 5 },
      communication: { type: Number, min: 0, max: 10, default: 5 },
      overall: { type: Number, min: 0, max: 10, default: 5 },
    },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    suggestions: [{ type: String }],
    improvedAnswerExample: { type: String, default: '' },
    rawModelOutput: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
