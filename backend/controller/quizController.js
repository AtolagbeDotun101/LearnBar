import Quiz from "../model/Quiz.js";

// @desc Get all quizzes for a document
// @route GET /api/quiz/:documentId
// @access Private
export const getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({
      userId: req.user._id,
      documentId: req.params.documentId,
    })
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Quizzes fetched successfully",
      success: true,
      data: quizzes,
      count: quizzes.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get a quiz by id
// @route GET /api/quiz/:id
// @access Private
export const getQuizById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findOne({ _id: id, userId: req.user._id });
    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
        success: false,
        statusCode: 404,
      });
    }
    res.status(200).json({
      message: "Quiz fetched successfully",
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Submit a quiz
// @route POST /api/quiz/:id/submit
// @access Private
export const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;
    const { id } = req.params;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        message: "Answers are required",
        success: false,
        statusCode: 400,
      });
    }

    const quiz = await Quiz.findOne({ _id: id, userId: req.user._id });
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }
    if (quiz.completedAt) {
      return res.status(404).json({
        success: false,
        error: "Quiz already completed",
        statusCode: 404,
      });
    }

    // process answer
    let correctCount = 0;
    const userAnswers = [];
    answers.forEach((answer) => {
      const { questionIndex, selectedAnswer } = answer;

      if (questionIndex < quiz.questions.length) {
        const question = quiz.questions[questionIndex];
        const isCorrect = selectedAnswer === question.correctAnswer;

        if (isCorrect) correctCount++;

        userAnswers.push({
          questionIndex,
          selectedAnswer,
          isCorrect,
          answeredAt: new Date(),
        });
      }
    });

    // calculate total score - fall back to questions.length if totalQuestions missing
    const totalQuestions = quiz.totalQuestions || quiz.questions.length || 0;
    const rawScore = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const score = Math.round(rawScore);

    //update quiz
    quiz.userAnswers = userAnswers;
    quiz.score = score;
    quiz.completedAt = new Date();

    await quiz.save();
    res.status(200).json({
      success: true,
      data: {
        quizId: quiz._id,
        score,
        correctCount,
        totalQuestions,
        percentage: score,
        userAnswers,
      },
      message: "Quiz submitted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get quiz results
// @route GET /api/quiz/:id/results
// @access Private
export const getQuizResults = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findOne({
      _id: id,
      userId: req.user._id,
    }).populate("documentId", "title");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    if (!quiz.completedAt) {
      return res.status(404).json({
        success: false,
        error: "Quiz not completed yet",
        statusCode: 404,
      });
    }

    //Build detailed results
    const detailedResults = quiz.questions.map((question, index) => {
      const userAnswer = quiz.userAnswers.find(
        (a) => a.questionIndex === index
      );
      return {
        questionIndex: index,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        selectedAnswer: userAnswer?.selectedAnswer || null,
        isCorrect: userAnswer?.isCorrect || false,
        explanation: question.explanation,
      };
    });
    res.status(200).json({
      success: true,
      data: {
        quiz: {
          id: quiz._id,
          title: quiz.title,
          document: quiz.documentId,
          score: quiz.score,
          totalQuestions: quiz.totalQuestions,
          completedAt: quiz.completedAt,
        },
        results: detailedResults,
      },
      message: "Result retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete a quiz
// @route DELETE /api/quiz/:id
// @access Private
export const deleteQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findOne({ _id: id, userId: req.user._id });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    await quiz.deleteOne();
    res.status(200).json({
      success: true,
      error: "Quiz deleted successfully",
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};
