import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  userAnswer: {
    type: String,
    default: '',
  },
  responseTimeSeconds: {
    type: Number,
    default: 0,
  },
  feedback: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feedback',
  },
});

const interviewSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['Technical', 'Behavioral', 'HR', 'System Design', 'Mixed'],
      required: true,
    },
    role: {
      type: String,
      default: 'General',
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
    },
    answers: [answerSchema],
    overallScore: {
      type: Number,
      default: 0,
    },
    proctoring: {
      enabled: { type: Boolean, default: false },
      proctorScore: { type: Number, default: 100 },
      faceInFramePercent: { type: Number, default: 100 },
      eyeContactPercent: { type: Number, default: 100 },
      warningCount: { type: Number, default: 0 },
      flags: [{ type: String }],
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
export default InterviewSession;
