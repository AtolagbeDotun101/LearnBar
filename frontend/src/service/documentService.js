import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPath';

/**
 * Upload a new document
 * @param {File} file - Document file to upload
 * @returns {Promise} Uploaded document data
 */
const uploadDocument = async (formData) => {
  try {
    

    const response = await axiosInstance.post(
      API_PATHS.DOCUMENTS.UPLOAD,
      formData,
      // {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // }
    );
    // console.log(response);
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

/**
 * Get all documents for the user
 * @returns {Promise} Array of user documents
 */
const getDocuments = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_DOCUMENTS);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

/**
 * Get document by ID
 * @param {string} id - Document ID
 * @returns {Promise} Document data with content
 */
const getDocumentById = async (id) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.DOCUMENTS.GET_DOCUMENT_BY_ID(id)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

/**
 * Update document
 * @param {string} id - Document ID
 * @param {object} updateData - Document update data
 * @returns {Promise} Updated document data
 */
const updateDocument = async (id, updateData) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.DOCUMENTS.UPDATE_DOCUMENT(id),
      updateData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

/**
 * Delete document
 * @param {string} id - Document ID
 * @returns {Promise} Delete confirmation
 */
const deleteDocument = async (id) => {
  try {
    const response = await axiosInstance.delete(
      API_PATHS.DOCUMENTS.DELETE_DOCUMENT(id)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

const documentService = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
};

export default documentService;
