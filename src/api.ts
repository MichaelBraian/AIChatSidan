import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
    'OpenAI-Beta': 'assistants=v1'
  }
});

const ASSISTANT_ID = 'asst_Xxj6YDxMDmNHkSq9iMgflz8F';
let threadId: string | null = null;

export const sendMessageToAssistant = async (messages: { role: string; content: string }[]) => {
  try {
    if (!threadId) {
      const threadResponse = await api.post('/threads', {});
      threadId = threadResponse.data.id;
    }

    const latestMessage = messages[messages.length - 1];
    await api.post(`/threads/${threadId}/messages`, {
      role: latestMessage.role,
      content: latestMessage.content
    });

    const runResponse = await api.post(`/threads/${threadId}/runs`, {
      assistant_id: ASSISTANT_ID
    });

    let runStatus = runResponse.data.status;
    let attempts = 0;
    const maxAttempts = 30;

    while (runStatus !== 'completed' && runStatus !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const statusResponse = await api.get(`/threads/${threadId}/runs/${runResponse.data.id}`);
      runStatus = statusResponse.data.status;
      attempts++;

      if (runStatus === 'requires_action') {
        console.log('Function call required');
        // Implement function call handling if needed
      }
    }

    if (runStatus === 'failed' || attempts >= maxAttempts) {
      throw new Error(`Assistant run ${runStatus === 'failed' ? 'failed' : 'timed out'}`);
    }

    const messagesResponse = await api.get(`/threads/${threadId}/messages`);
    const assistantMessage = messagesResponse.data.data[0].content[0].text.value;

    return assistantMessage;
  } catch (error) {
    console.error('Error in sendMessageToAssistant:', error);
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      throw new Error(`API Error: ${errorMessage}`);
    }
    throw error;
  }
};
