import mongoose from "mongoose";

const quizSchema = mongoose.Schema({
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },

  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  questions: [{
    question: {
      type: String,
      required: [true, 'Question text is required'],
    },
    options: [{
      text: {
        type: String,
        required: [true, 'Option text is required'],
        validate:[array => array.length === 4, 'At least 4 option is required']
      },
      correctAnswer: {
        type: String,
        required: true,
      },
      explanation: {
        type: String,
        default: '',
      },
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
        required: [true, 'Difficulty level is required'],
    },
    selectedAnswer: {
        type: String,
        default: null,
    },
    isCorrect: {
        type: Boolean,
        required: true,
    },
    answeredAt: {
        type: Date,
        default: Date.now,
    },
    score: {
        type: Number,
        required: true,
    },
    completedAt: {
        type: Date,
        default: null,
    }

    }],
  }],
}, {
  timestamps: true
});

//indexes for efficient querying
quizSchema.index({ userId: 1,  documentId: 1});
quizSchema.index({ title: 'text', description: 'text' });

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz; 