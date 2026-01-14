import axiosInstance from '../utils/axiosInstance.js';
import { API_PATHS } from '../utils/apiPath';

/**
 * Register a new user
 * @param {string} username - User's username
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise} User data and JWT token
 */
const register = async (username:string, email:string, password:string) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

/**
 * Login user
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise} User data and JWT token
 */
const login = async (email:string, password:string) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
      email,
      password,
    });
    
    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error:any) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

/**
 * Get user profile
 * @returns {Promise} User profile data
 */
const getProfile = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
    return response.data;
  } catch (error:any) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

/**
 * Update user profile
 * @param {object} profileData - Updated user profile data
 * @param {string} profileData.username - Updated username
 * @param {string} profileData.email - Updated email
 * @returns {Promise} Updated user profile data
 */
const updateProfile = async (profileData:object) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.AUTH.UPDATE_PROFILE,
      profileData
    );
    
    // Update user data in localStorage
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error:any) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

/**
 * Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise} Success message
 */
const changePassword = async (currentPassword:string, newPassword:string) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.AUTH.CHANGE_PASSWORD,
      {
        currentPassword,
        newPassword,
      }
    );
    return response.data;
  } catch (error:any) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

/**
 * Logout user
 * Removes token and user data from localStorage
 */
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Get stored user data from localStorage
 * @returns {object} User data or null
 */
const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists in localStorage
 */
const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

const authService = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  getStoredUser,
  isAuthenticated,
};

export default authService;
