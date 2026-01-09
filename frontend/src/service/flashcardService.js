import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPath';

/**
 * Get all flashcard sets for user
 * @returns {Promise} Array of flashcard sets
 */
const getAllFlashcardSets = async () => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.FLASHCARDS.GET_ALL_FLASHCARD_SETS
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

/**
 * Get flashcards for a specific document
 * @param {string} documentId - Document ID
 * @returns {Promise} Array of flashcards for the document
 */
const getFlashcardsForDoc = async (documentId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.FLASHCARDS.GET_FLASHCARDS_FOR_DOC(documentId)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

/**
 * Review a flashcard
 * @param {string} cardId - Flashcard ID
 * @param {object} reviewData - Review data (difficulty, etc.)
 * @returns {Promise} Updated flashcard
 */
const reviewFlashcard = async (cardId, reviewData) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.FLASHCARDS.REVIEW_FLASHCARD(cardId),
      reviewData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

/**
 * Toggle star (favorite) on a flashcard
 * @param {string} cardId - Flashcard ID
 * @returns {Promise} Updated flashcard
 */
const toggleStar = async (cardId) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.FLASHCARDS.TOGGLE_STAR(cardId)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

/**
 * Delete a flashcard set
 * @param {string} id - Flashcard set ID
 * @returns {Promise} Delete confirmation
 */
const deleteFlashcardSet = async (id) => {
  try {
    const response = await axiosInstance.delete(
      API_PATHS.FLASHCARDS.DELETE_FLASHCARD_SET(id)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

const flashcardService = {
  getAllFlashcardSets,
  getFlashcardsForDoc,
  reviewFlashcard,
  toggleStar,
  deleteFlashcardSet,
};

export default flashcardService;
