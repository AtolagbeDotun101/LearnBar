import Flashcard from "../model/Flashcard.js";
import mongoose from "mongoose";

// @desc    Get flashcards for a document
// @route   GET /api/flashcards/:documentId
// @access  Private
export const getFlashcardsByDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({
        message: "Invalid document ID",
        success: false,
        status: "failed",
      });
    }

    const flashcards = await Flashcard.find({
      documentId: documentId,
      userId: req.user._id,
    })
      .populate("documentId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Flashcards fetched successfully",
      success: true,
      data: flashcards,
      count: flashcards.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all flashcards for the authenticated user
// @route GET /api/flashcards
// @access Private
export const getUserFlashcards = async (req, res, next) => {
  try {
    const flashcards = await Flashcard.find({ userId: req.user._id })
      .populate("documentId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Flashcards fetched successfully",
      success: true,
      data: flashcards,
      count: flashcards.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Review a single flashcard within a set
// @route PUT /api/flashcards/:cardId/review
// @access Private
export const reviewFlashcard = async (req, res, next) => {
  try {
    const { cardId } = req.params;

    if (!cardId) {
      return res.status(400).json({
        message: "Invalid flashcard ID",
        success: false,
        status: "failed",
      });
    }

    // Find the flashcard set that contains this card
    const flashcardSet = await Flashcard.findOne({
      "cards._id": cardId,
      userId: req.user._id,
    });

    if (!flashcardSet) {
      return res.status(404).json({
        message: "Flashcard not found",
        success: false,
        status: "failed",
      });
    }

    const cardIndex = flashcardSet.cards.findIndex(
      (card) => card._id.toString() === cardId
    );

    if (cardIndex === -1) {
      return res.status(404).json({
        message: "Flashcard not found in the set",
        success: false,
        status: "failed",
      });
    }

    // Mark the flashcard as reviewed
    flashcardSet.cards[cardIndex].lastReviewed = new Date();
    flashcardSet.cards[cardIndex].reviewCount =
      (flashcardSet.cards[cardIndex].reviewCount || 0) + 1;

    await flashcardSet.save();

    res.status(200).json({
      message: "Flashcard reviewed successfully",
      success: true,
      data: flashcardSet.cards[cardIndex],
    });
  } catch (error) {
    next(error);
  }
};


// @desc Toggle flashcard favorite status
// @route PUT /api/flashcards/:id/favorite
// @access Private
export const toggleFavoriteFlashcard = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findOne({
      "cards._id": req.params.id,
      userId: req.user._id,
    });

    if (!flashcardSet) {
      return res.status(404).json({
        message: "Flashcard not found",
        success: false,
        status: "failed",
      });
    }

    const cardIndex = flashcardSet.cards.findIndex(
      (card) => card._id.toString() === req.params.id
    );

    if (cardIndex === -1) {
      return res.status(404).json({
        message: "Flashcard not found in the set",
        success: false,
        status: "failed",
      });
    }

    // Toggle favorite status
    flashcardSet.cards[cardIndex].isStarred =
      !flashcardSet.cards[cardIndex].isStarred;

    await flashcardSet.save();

    res.status(200).json({
      message: `Flashcard ${
        flashcardSet.cards[cardIndex].isStarred ? "starred" : "unstarred"
      } successfully`,
      success: true,
      data: flashcardSet,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete a flashcard
// @route DELETE /api/flashcards/:id
// @access Private
export const deleteFlashcard = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Invalid flashcard ID",
        success: false,
        status: "failed",
      });
    }

    const flashcard = await Flashcard.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!flashcard) {
      return res.status(404).json({
        message: "Flashcard not found",
        success: false,
        status: "failed",
      });
    }

    await flashcard.deleteOne();

    res.status(200).json({
      message: "Flashcard deleted successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
