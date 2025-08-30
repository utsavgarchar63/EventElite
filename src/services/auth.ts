import axios from 'axios';

const API_URL = 'https://example.com/api';

export const loginUser = async (email: string, password: string) => {
     try {
          const response = await axios.post(`${API_URL}/login`, { email, password });
          return response.data;
     } catch (error: any) {
          throw error.response?.data || { message: 'Something went wrong' };
     }
};
