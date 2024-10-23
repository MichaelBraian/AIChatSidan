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

export const sendMessageToAssistant = async (messages: { role: string; content: string }[]) => {
  try {
    // Create a new thread
    const threadResponse = await api.post('/threads', {});
    const threadId = threadResponse.data.id;

    // Add a message to the thread
    await api.post(`/threads/${threadId}/messages`, {
      role: 'user',
      content: messages[messages.length - 1].content
    });

    // Run the assistant
    const runResponse = await api.post(`/threads/${threadId}/runs`, {
      assistant_id: ASSISTANT_ID
    });

    // Wait for the run to complete
    let runStatus = runResponse.data.status;
    let attempts = 0;
    const maxAttempts = 30; // Adjust this value as needed

    while (runStatus !== 'completed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const statusResponse = await api.get(`/threads/${threadId}/runs/${runResponse.data.id}`);
      runStatus = statusResponse.data.status;
      attempts++;
    }

    if (runStatus !== 'completed') {
      throw new Error('Assistant run timed out');
    }

    // Retrieve the messages
    const messagesResponse = await api.get(`/threads/${threadId}/messages`);
    const assistantMessage = messagesResponse.data.data[0].content[0].text.value;

    if (!assistantMessage) {
      throw new Error('No response from assistant');
    }

    return assistantMessage;
  } catch (error) {
    console.error('Error in sendMessageToAssistant:', error);
    throw error; // Re-throw the error to be handled by the component
  }
};
