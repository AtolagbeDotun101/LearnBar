import axios from 'axios'
import {BASE_URL} from './apiPath.ts'



const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 80000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
})

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    // ✅ Fix: Don't set Content-Type for FormData
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      // Browser will automatically set multipart/form-data with correct boundary
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 500) {
        console.error("Server error. Please try again later.");
      } else if (error.code === "ECONNABORTED") {
        console.error("Request timeout. Please try again.");
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;