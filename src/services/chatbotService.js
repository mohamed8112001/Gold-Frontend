import { apiRequest, handleApiError } from './api.js';
import { API_ENDPOINTS } from '../utils/constants.js';

export const chatbotService = {
  // Send message to chatbot
  sendMessage: async (message) => {
    try {
      const response = await apiRequest.post(API_ENDPOINTS.CHATBOT.SEND_MESSAGE, {
        message: message.trim()
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};

export default chatbotService;
