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
  questions: [{
    question: {
      type: String,
      required: [true, 'Question text is required'],
    },
    options: {
      type: [String],
      required: [true, 'Options are required'],
      validate: {
        validator: function(arr) {
          return arr.length === 4;
        },
        message: 'Each question must have exactly 4 options'
      }
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
    },
  }],
  userAnswers: [{
    questionIndex: {
      type: Number,
      required: true,
    },
    selectedAnswer: {
      type: String,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    answeredAt: {
      type: Date,
      default: Date.now,
    },
  }],
  score: {
    type: Number,
    default: null,
  },
  totalQuestions:{
    type: Number,
    require:true
  },
  completedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true
});

// Indexes for efficient querying
quizSchema.index({ userId: 1, documentId: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;