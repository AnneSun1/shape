import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useMessage } from '@/hooks/useMessage';

export const ChatExample: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [chatTitle, setChatTitle] = useState('');

  const { user, isAuthenticated, loading: authLoading, error: authError, login, signup } = useAuth();
  const { chats, currentChat, loading: chatLoading, error: chatError, createChat, fetchChats } = useChat();
  const { messages, loading: messageLoading, error: messageError, sendUserMessage, fetchMessagesByChat } = useMessage();

  useEffect(() => {
    if (isAuthenticated) {
      fetchChats();
    }
  }, [isAuthenticated, fetchChats]);

  useEffect(() => {
    if (currentChat) {
      fetchMessagesByChat(currentChat.id);
    }
  }, [currentChat, fetchMessagesByChat]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    await signup({ email, password });
  };

  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    await createChat({ title: chatTitle });
    setChatTitle('');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentChat) {
      await sendUserMessage(messageContent, currentChat.id);
      setMessageContent('');
    } else {
      // Create new chat with message
      await sendUserMessage(messageContent);
      setMessageContent('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Login/Signup</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full"
          />
          <div className="space-x-2">
            <button type="submit" disabled={authLoading} className="bg-blue-500 text-white px-4 py-2 rounded">
              {authLoading ? 'Logging in...' : 'Login'}
            </button>
            <button type="button" onClick={handleSignup} disabled={authLoading} className="bg-green-500 text-white px-4 py-2 rounded">
              {authLoading ? 'Signing up...' : 'Signup'}
            </button>
          </div>
        </form>
        {authError && <p className="text-red-500 mt-2">{authError}</p>}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Welcome, {user?.email}!</h2>
      
      {/* Create Chat */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Create New Chat</h3>
        <form onSubmit={handleCreateChat} className="flex gap-2">
          <input
            type="text"
            placeholder="Chat title"
            value={chatTitle}
            onChange={(e) => setChatTitle(e.target.value)}
            className="border p-2 flex-1"
          />
          <button type="submit" disabled={chatLoading} className="bg-blue-500 text-white px-4 py-2 rounded">
            {chatLoading ? 'Creating...' : 'Create Chat'}
          </button>
        </form>
      </div>

      {/* Chat List */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Your Chats</h3>
        <div className="space-y-2">
          {chats.map((chat) => (
            <div key={chat.id} className="border p-3 rounded">
              <h4 className="font-medium">{chat.title}</h4>
              <p className="text-sm text-gray-600">
                {chat.messageCount} messages • {new Date(chat.updatedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Send Message */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Send Message</h3>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            className="border p-2 flex-1"
          />
          <button type="submit" disabled={messageLoading} className="bg-green-500 text-white px-4 py-2 rounded">
            {messageLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>

      {/* Messages */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Messages</h3>
        <div className="space-y-2">
          {messages.map((message) => (
            <div key={message.id} className="border p-3 rounded">
              <div className="flex justify-between items-start">
                <span className="font-medium">{message.role}</span>
                <span className="text-sm text-gray-600">
                  {new Date(message.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-1">{message.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {(chatError || messageError) && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {chatError && <p>Chat Error: {chatError}</p>}
          {messageError && <p>Message Error: {messageError}</p>}
        </div>
      )}
    </div>
  );
};
