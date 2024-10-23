import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
    'OpenAI-Beta': 'assistants=v2',
  }
});

const ASSISTANT_ID = 'asst_Xxj6YDxMDmNHkSq9iMgflz8F';
let threadId: string | null = null;

// Function to create an assistant (if needed)
const createAssistant = async () => {
  try {
    const response = await api.post('/assistants', {
      name: "Odontologisk Journalrättning Assistant",
      instructions: "Du är en expert på journalförning inom tandvården. Du kan hjälpa till med att rätta journaler.",
      model: "gpt-4o",
      tools: [{ type: "code_interpreter" }]
    });
    return response.data.id;
  } catch (error) {
    console.error('Error creating assistant:', error);
    throw error;
  }
};

export const sendMessageToAssistant = async (messages: { role: string; content: string }[]) => {
  try {
    // Create a thread if it doesn't exist
    if (!threadId) {
      const threadResponse = await api.post('/threads', {});
      threadId = threadResponse.data.id;
    }

    // Add the message to the thread
    const latestMessage = messages[messages.length - 1];
    await api.post(`/threads/${threadId}/messages`, {
      role: 'user',
      content: latestMessage.content
    });

    // Create a run
    const runResponse = await api.post(`/threads/${threadId}/runs`, {
      assistant_id: ASSISTANT_ID,
      instructions: "Du är en expert på journalförning inom tandvården. Du kan hjälpa till med att rätta journaler."
    });

    // Poll for completion
    let runStatus = runResponse.data.status;
    let attempts = 0;
    const maxAttempts = 50;

    while (runStatus !== 'completed' && runStatus !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const statusResponse = await api.get(`/threads/${threadId}/runs/${runResponse.data.id}`);
      runStatus = statusResponse.data.status;
      attempts++;
    }

    if (runStatus === 'failed' || attempts >= maxAttempts) {
      threadId = null;
      throw new Error(`Assistant run ${runStatus === 'failed' ? 'failed' : 'timed out'}`);
    }

    // Get the latest message
    const messagesResponse = await api.get(`/threads/${threadId}/messages`);
    const assistantMessage = messagesResponse.data.data[0].content[0].text.value;

    return assistantMessage;
  } catch (error) {
    console.error('Error in sendMessageToAssistant:', error);
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      const errorCode = error.response?.status;
      
      if (errorCode === 404) {
        threadId = null;
        // Retry the operation once
        return sendMessageToAssistant(messages);
      }
      
      throw new Error(`API Error (${errorCode}): ${errorMessage}`);
    }
    throw error;
  }
};
