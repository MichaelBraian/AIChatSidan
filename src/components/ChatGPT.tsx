import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Copy, Check } from 'lucide-react';
import { sendMessageToAssistant } from '../api';

const ChatGPT = () => {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Du är en expert på journalförning inom tandvården. Du kan hjälpa till med att rätta journaler.', id: 'system-0' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() && !isLoading) {
      setIsLoading(true);
      const newMessage = { role: 'user', content: input, id: `user-${Date.now()}` };
      const newMessages = [...messages, newMessage];
      setMessages(newMessages);
      setInput('');

      try {
        const responseContent = await sendMessageToAssistant(newMessages);
        const assistantMessage = { role: 'assistant', content: responseContent, id: `assistant-${Date.now()}` };
        setMessages([...newMessages, assistantMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
        let errorMessage = 'Sorry, an error occurred while processing your message. Please try again.';
        if (error instanceof Error) {
          errorMessage += ` (${error.message})`;
        }
        const errorAssistantMessage = { role: 'assistant', content: errorMessage, id: `error-${Date.now()}` };
        setMessages([...newMessages, errorAssistantMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCopy = (index: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const formatMessage = (content: string) => {
    const lines = content.split('\n');
    let formattedContent: JSX.Element[] = [];
    let currentParagraph: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        formattedContent.push(<p key={formattedContent.length} className="mb-2">{currentParagraph.join(' ')}</p>);
        currentParagraph = [];
      }
    };

    lines.forEach((line, index) => {
      if (line.includes('**') && line.split('**').length > 2) {
        flushParagraph();
        const parts = line.split('**');
        let formattedLine: JSX.Element[] = [];
        parts.forEach((part, i) => {
          if (i % 2 === 1) {
            formattedLine.push(<strong key={i}>{part}</strong>);
          } else {
            formattedLine.push(<span key={i}>{part}</span>);
          }
        });
        formattedContent.push(<p key={`line-${index}`} className="mb-2">{formattedLine}</p>);
      } else if (line.trim() === '---') {
        flushParagraph();
        formattedContent.push(<hr key={`hr-${index}`} className="my-4" />);
      } else if (line.trim() === '') {
        flushParagraph();
      } else {
        currentParagraph.push(line);
      }
    });

    flushParagraph();

    return formattedContent;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4">
        <div className="container mx-auto flex items-center">
          <Link to="/dashboard" className="text-gray-600 hover:text-gray-800 mr-4">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Odontologisk Journalrättning</h1>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 overflow-y-auto">
        <div className="space-y-4">
          {messages.slice(1).map((message, index) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`relative max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-3 ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'}`}>
                {message.role === 'user' ? (
                  <p>{message.content}</p>
                ) : (
                  <div className="prose">{formatMessage(message.content)}</div>
                )}
                {message.role === 'assistant' && (
                  <button
                    onClick={() => handleCopy(index, message.content)}
                    className="absolute bottom-2 right-2 text-gray-500 hover:text-gray-700"
                  >
                    {copiedIndex === index ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>
      <footer className="bg-white border-t border-gray-200 p-4">
        <div className="container mx-auto flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-grow mr-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            className={`bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatGPT;
