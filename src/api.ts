import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // This would be the URL of your server-side API
});

export const sendMessageToAssistant = async (messages: { role: string; content: string }[]) => {
  try {
    const response = await api.post('/chat', { messages });
    return response.data.message;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error sending message:', error.response?.data || error.message);
    } else {
      console.error('An unexpected error occurred:', error);
    }
    return null;
  }
};
