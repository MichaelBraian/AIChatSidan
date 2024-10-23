import React from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { MessageSquare, Bot, LogOut } from 'lucide-react';

const Dashboard = () => {
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex flex-col">
      <header className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Personal AI Chat</h1>
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/chat/gpt" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
            <div className="flex items-center mb-4">
              <MessageSquare className="w-8 h-8 text-green-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">ChatGPT</h2>
            </div>
            <p className="text-gray-600">Start a conversation with OpenAI's ChatGPT model.</p>
          </Link>
          <Link to="/chat/claude" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
            <div className="flex items-center mb-4">
              <Bot className="w-8 h-8 text-purple-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">Claude</h2>
            </div>
            <p className="text-gray-600">Engage in a dialogue with Anthropic's Claude AI.</p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;