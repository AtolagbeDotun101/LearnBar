import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPath';

/**
 * Get all quizzes for a document
 * @param {string} documentId - Document ID
 * @returns {Promise} Array of quizzes
 */
const getQuizzesForDoc = async (documentId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.QUIZZES.GET_QUIZZES_FOR_DOC(documentId)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

/**
 * Get quiz by ID
 * @param {string} id - Quiz ID
 * @returns {Promise} Quiz data
 */
const getQuizById = async (id) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.QUIZZES.GET_QUIZ_BY_ID(id)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

/**
 * Submit quiz answers
 * @param {string} id - Quiz ID
 * @param {array} answers - Array of selected answer indices
 * @returns {Promise} Quiz results with score
 */
const submitQuiz = async (id, answers) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.QUIZZES.SUBMIT_QUIZ(id),
      { answers }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

/**
 * Get quiz results
 * @param {string} id - Quiz ID
 * @returns {Promise} Quiz results
 */
const getQuizResults = async (id) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.QUIZZES.GET_QUIZ_RESULTS(id)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

/**
 * Delete a quiz
 * @param {string} id - Quiz ID
 * @returns {Promise} Delete confirmation
 */
const deleteQuiz = async (id) => {
  try {
    const response = await axiosInstance.delete(
      API_PATHS.QUIZZES.DELETE_QUIZ(id)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

const quizService = {
  getQuizzesForDoc,
  getQuizById,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
};

export default quizService;
