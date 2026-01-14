import axiosInstance from '../utils/axiosInstance.js';
import { API_PATHS } from '../utils/apiPath';

/**
 * Get user progress dashboard data
 * @returns {Promise} Dashboard data including progress metrics
 */
const getDashboard = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.PROGRESS.GET_DASHBOARD);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

const progressService = {
  getDashboard,
};

export default progressService;