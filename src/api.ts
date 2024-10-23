import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
    'OpenAI-Beta': 'assistants=v2'
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
      model: "gpt-4-turbo-preview",
      tools: [{ type: "code_interpreter" }],
      tool_resources: {
        code_interpreter: {
          file_ids: []  // Add file IDs if needed
        }
      }
    });
    return response.data.id;
  } catch (error) {
    console.error('Error creating assistant:', error);
    throw error;
  }
};

export const sendMessageToAssistant = async (messages: { role: string; content: string }[]) => {
  try {
    if (!threadId) {
      const threadResponse = await api.post('/threads', {});
      threadId = threadResponse.data.id;
    }

    const latestMessage = messages[messages.length - 1];
    await api.post(`/threads/${threadId}/messages`, {
      role: latestMessage.role,
      content: latestMessage.content,
      attachments: []  // We're not using attachments now, but this is where you'd add them if needed
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
      const errorCode = error.response?.status;
      console.error(`API Error (${errorCode}):`, errorMessage);
      throw new Error(`API Error (${errorCode}): ${errorMessage}`);
    }
    throw error;
  }
};
