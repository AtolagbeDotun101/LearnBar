import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPath';

/**
 * Generate flashcards from document
 * @param {string} documentId - Document ID
 * @returns {Promise} Generated flashcards
 */
const generateFlashcards = async (documentId) => {
  try {
    const response = await axiosInstance.post(
      // API expects documentId as a URL param
      API_PATHS.AI.GENERATE_FLASHCARDS(documentId)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

/**
 * Generate quiz from document
 * @param {string} documentId - Document ID
 * @returns {Promise} Generated quiz
 */
const generateQuiz = async (documentId) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.GENERATE_QUIZ,
      { documentId }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

/**
 * Generate summary from document
 * @param {string} documentId - Document ID
 * @returns {Promise} Generated summary
 */
const generateSummary = async (documentId) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.GENERATE_SUMMARY,
      { documentId }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

/**
 * Chat with AI about document
 * @param {string} documentId - Document ID
 * @param {string} message - User message
 * @returns {Promise} AI response
 */
const chat = async (documentId, question) => {
  console.log(`${documentId} + ${question}`);
  
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.CHAT,
      { documentId, question }
    );
    return response.data;
  } catch (error) {
    console.log(error);
    
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

/**
 * Explain a concept from document
 * @param {string} documentId - Document ID
 * @param {string} concept - Concept to explain
 * @returns {Promise} Concept explanation
 */
const explainConcept = async (documentId, concept) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.EXPLAIN_CONCEPT,
      { documentId, concept }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

/**
 * Get chat history for a document
 * @param {string} documentId - Document ID
 * @returns {Promise} Chat history
 */
const getChatHistory = async (documentId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.AI.GET_CHAT_HISTORY(documentId)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

const aiService = {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory,
};

export default aiService;
