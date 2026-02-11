import React, { useState, useRef, useEffect } from 'react';
import Button from '../components/ui/Button';
import PetCanvas from '../components/PetCanvas';

/**
 * Message interface for chat messages
 */
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

/**
 * Quick action suggestions for the user
 */
const quickActions = [
  'How am I doing?',
  'Motivation tips',
  'Streak analysis',
  'Habit suggestions'
];

/**
 * Mock AI responses for demo purposes
 */
const mockAIResponses = [
  'Great job maintaining your streak! Your consistency in coding is impressive. Keep pushing!',
  'Here\'s a tip: Try to code at the same time every day. Consistency breeds habit formation.',
  'Your 7-day streak puts you in the top 20% of StreakBeast users. Amazing work!',
  'Consider adding a new habit to diversify your growth. Exercise pairs well with coding!',
  'Remember: every day you show up is a victory. Your pet is thriving because of your dedication!'
];

/**
 * Coach page component
 * 
 * Interactive AI coach chat interface where users can get motivation,
 * habit insights, and streak analysis through a conversational UI.
 */
function Coach(): React.ReactElement {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: 'Hey there! I\'m your AI coach powered by OpenClaw. Ask me anything about your habits, streaks, or get motivation tips!',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Scroll to bottom of messages when new messages arrive
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /**
   * Send a message and get AI response
   */
  const sendMessage = (text?: string): void => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length,
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response after 1-2 seconds
    const delay = 1000 + Math.random() * 1000;
    setTimeout(() => {
      const randomResponse = mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)];
      const aiMessage: Message = {
        id: messages.length + 1,
        text: randomResponse ?? '',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, delay);
  };

  /**
   * Handle keyboard events on input
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mini pet area at top */}
      <div className="h-[120px] mb-4 flex items-center gap-4">
        <div className="w-[120px] h-[120px]">
          <PetCanvas
            streakDays={7}
            isActive={true}
            className="rounded-xl overflow-hidden"
          />
        </div>
        <div>
          <h1 className="font-display font-bold text-white">AI Coach</h1>
          <p className="text-xs text-accent/60">Powered by OpenClaw</p>
        </div>
      </div>

      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'ai' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[70%] ${
                message.sender === 'ai'
                  ? 'bg-white/5 border border-white/10 rounded-2xl rounded-bl-none'
                  : 'bg-accent/20 border border-accent/30 rounded-2xl rounded-br-none'
              } px-4 py-3`}
            >
              <p className="text-sm text-white/90">{message.text}</p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[70%] bg-white/5 border border-white/10 rounded-2xl rounded-bl-none px-4 py-3">
              <div className="flex gap-1 items-center">
                <span
                  className="w-2 h-2 bg-accent/60 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="w-2 h-2 bg-accent/60 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="w-2 h-2 bg-accent/60 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
        {quickActions.map((action) => (
          <button
            key={action}
            className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
            onClick={() => sendMessage(action)}
          >
            {action}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="flex gap-2">
        <input
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-accent/50"
          placeholder="Ask your coach..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button variant="primary" onClick={() => sendMessage()}>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}

export default Coach;