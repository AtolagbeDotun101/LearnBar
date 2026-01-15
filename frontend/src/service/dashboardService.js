import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";

const getDashboard = async ()=>{
    try {
        const response = await axiosInstance.get(API_PATHS.PROGRESS.GET_DASHBOARD);
        console.log(response);
        
        return response.data;
    } catch (error) {
        
            throw error.response?.data || { message: 'Failed to fetch dashboard data' };
    }
}

const progressService ={
    getDashboard
};

export default progressService;