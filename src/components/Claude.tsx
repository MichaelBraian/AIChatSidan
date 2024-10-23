import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';

const Claude = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (input.trim()) {
      const newMessages = [...messages, { role: 'user', content: input }];
      setMessages(newMessages);
      setInput('');
      
      // TODO: Implement actual API call to Claude
      // For now, we'll just simulate a response
      setTimeout(() => {
        setMessages([...newMessages, { role: 'assistant', content: 'This is a simulated response from Claude.' }]);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4">
        <div className="container mx-auto flex items-center">
          <Link to="/dashboard" className="text-gray-600 hover:text-gray-800 mr-4">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Claude</h1>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-3 ${message.role === 'user' ? 'bg-purple-500 text-white' : 'bg-white text-gray-800'}`}>
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </main>
      <footer className="bg-white border-t border-gray-200 p-4">
        <div className="container mx-auto flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow mr-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleSend}
            className="bg-purple-500 text-white p-2 rounded-md hover:bg-purple-600 transition duration-300"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Claude;