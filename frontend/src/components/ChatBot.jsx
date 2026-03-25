import { useState } from 'react';

const API_BASE_URL = 'http://localhost:8000/api';

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! 👋 Welcome to HotelHive. I\'m here to help! Ask me anything about our rooms, bookings, policies, or facilities.',
      suggestions: ['How to book a room?', 'Show available rooms', 'What are amenities?'],
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessageToBackend = async (message) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/chat/send_message/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chat engine');
      }

      const data = await response.json();
      return {
        text: data.response,
        intent: data.intent,
        suggestions: data.suggestions || [],
        rooms: data.rooms || [],
      };
    } catch (error) {
      console.error('Chat error:', error);
      return {
        text: 'Sorry, I encountered an error processing your message. Please try again.',
        intent: 'error',
        suggestions: [],
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage = userInput;

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        type: 'user',
        text: userMessage,
      },
    ]);

    setUserInput('');

    // Get bot response from backend
    const botResponse = await sendMessageToBackend(userMessage);

    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        type: 'bot',
        text: botResponse.text,
        intent: botResponse.intent,
        suggestions: botResponse.suggestions,
        rooms: botResponse.rooms,
      },
    ]);
  };

  const handleQuickQuestion = async (question) => {
    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        type: 'user',
        text: question,
      },
    ]);

    // Get bot response from backend
    const botResponse = await sendMessageToBackend(question);

    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        type: 'bot',
        text: botResponse.text,
        intent: botResponse.intent,
        suggestions: botResponse.suggestions,
        rooms: botResponse.rooms,
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Chat Widget */}
      {isOpen && (
        <div className="bg-background rounded-2xl shadow-2xl w-96 max-h-96 flex flex-col mb-4 border-2 border-accent animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="font-bold text-lg">HotelHive AI Assistant</h3>
                  <p className="text-xs text-blue-100">Smart chat powered by AI</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-secondary p-1 rounded transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="flex flex-col gap-2 max-w-xs">
                  <div
                    className={`px-4 py-2 rounded-lg text-sm leading-relaxed ${
                      msg.type === 'user'
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-white border border-accent text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Display Rooms if available */}
                  {msg.rooms && msg.rooms.length > 0 && (
                    <div className="space-y-2">
                      {msg.rooms.map((room, idx) => (
                        <div key={idx} className="bg-blue-50 border border-accent rounded p-2 text-xs text-gray-700">
                          <p className="font-semibold text-primary">{room.room_type}</p>
                          <p>Price: ₹{room.price}/night</p>
                          <p>Capacity: {room.capacity} guests</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Display Suggestions */}
                  {msg.suggestions && msg.suggestions.length > 0 && msg.type === 'bot' && (
                    <div className="space-y-1 mt-1">
                      {msg.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickQuestion(suggestion)}
                          className="block w-full text-left px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 border border-accent rounded transition text-primary font-semibold"
                        >
                          💡 {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-2 bg-white border border-accent rounded-lg text-gray-600 text-sm">
                  <span className="inline-block animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-accent p-4 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm disabled:bg-gray-100"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="px-4 py-2 bg-primary hover:bg-secondary text-white rounded-lg transition font-semibold disabled:bg-gray-400"
              >
                {isLoading ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-lg font-bold text-2xl transition-all duration-300 flex items-center justify-center transform ${
          isOpen
            ? 'bg-highlight hover:opacity-90 scale-90'
            : 'bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:scale-110'
        }`}
        title={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
};
