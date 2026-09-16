import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Question text is required'],
    },
    category: {
      type: String,
      required: true,
      enum: ['Technical', 'Behavioral', 'HR', 'System Design'],
    },
    role: {
      type: String,
      default: 'General',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    idealPoints: [
      {
        type: String,
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model('Question', questionSchema);
export default Question;
