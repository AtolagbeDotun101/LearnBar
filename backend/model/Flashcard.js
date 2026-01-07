import mongoose from "mongoose";

const flashcardSchema = mongoose.Schema(
  {
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
    cards: [{
        question: {
            type: String,
            required: [true, 'Question text is required'],
        },
        answer: {
            type: String,
            required: [true, 'Answer text is required'],
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
            required: [true, 'Difficulty level is required'],
        },
        reviewCount: {
            type: Number,
            default: 0,
        },
       isStarred: {
            type: Boolean,
            default: false,
       },

    }]
  },
  {
    timestamps: true,
  }
);

//index to optimize queries by userId and documentId
flashcardSchema.index({ userId: 1, documentId: 1 });

const Flashcard = mongoose.model('Flashcard', flashcardSchema);

export default Flashcard;