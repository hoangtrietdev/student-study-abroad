import { useState, useRef, useEffect, useCallback } from 'react';
import { CHATBOT_CONFIG, generateWelcomeMessage } from '@/constants/chatbot';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize welcome message when chatbot opens for the first time
  const initializeWelcomeMessage = useCallback(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome-' + Date.now(),
        content: generateWelcomeMessage(),
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when drawer opens and initialize welcome message
  useEffect(() => {
    if (isOpen) {
      initializeWelcomeMessage();
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isOpen, initializeWelcomeMessage]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call your chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.content, 
          history: messages.map(m => ({ role: m.role, content: m.content }))
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: CHATBOT_CONFIG.ERROR_MESSAGES.GENERIC,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    // Re-initialize welcome message after clearing
    setTimeout(() => {
      initializeWelcomeMessage();
    }, 100);
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    // Auto-send the question
    const userMessage: Message = {
      id: Date.now().toString(),
      content: question,
      role: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Send to API (same logic as sendMessage)
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: question, 
        history: messages.map(m => ({ role: m.role, content: m.content }))
      }),
    })
    .then(response => response.json())
    .then(data => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    })
    .catch(error => {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: CHATBOT_CONFIG.ERROR_MESSAGES.GENERIC,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-3 md:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
        aria-label="Open AI Chat"
      >
        <svg
          className="w-6 h-6 md:w-7 md:h-7 group-hover:scale-110 transition-transform duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {/* Chat Drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-gray-900 border-l border-gray-700 shadow-xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-semibold text-white">{CHATBOT_CONFIG.UI_TEXT.HEADER_TITLE}</h3>
              </div>
              <div className="flex items-center space-x-2">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="text-gray-400 hover:text-gray-200 p-1 rounded transition-colors"
                    title={CHATBOT_CONFIG.UI_TEXT.CLEAR_CHAT_TOOLTIP}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-200 p-1 rounded transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{CHATBOT_CONFIG.UI_TEXT.EMPTY_STATE.TITLE}</h3>
                  <p className="text-sm">{CHATBOT_CONFIG.UI_TEXT.EMPTY_STATE.SUBTITLE}</p>
                  <p className="text-xs mt-2">{CHATBOT_CONFIG.UI_TEXT.EMPTY_STATE.DESCRIPTION}</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-lg text-sm ${
                        message.role === 'user'
                          ? 'bg-gray-700 text-white'
                          : message.id.startsWith('welcome-')
                          ? 'bg-gradient-to-r from-green-800 to-green-900 text-gray-100 border border-green-600/50'
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border border-blue-500/50'
                      }`}
                    >
                      {message.id.startsWith('welcome-') ? (
                        // Special formatting for welcome message
                        <div className="space-y-2">
                          {message.content.split('\n\n').map((paragraph, idx) => {
                            if (paragraph.includes('**') || paragraph.includes('•')) {
                              // Handle bold text and bullet points
                              return (
                                <div key={idx} className="space-y-1">
                                  {paragraph.split('\n').map((line, lineIdx) => {
                                    if (line.startsWith('**') && line.endsWith('**')) {
                                      // Bold headers
                                      return (
                                        <div key={lineIdx} className="font-bold text-green-200 text-base">
                                          {line.replace(/\*\*/g, '')}
                                        </div>
                                      );
                                    } else if (line.startsWith('•')) {
                                      // Bullet points
                                      return (
                                        <div key={lineIdx} className="text-gray-200 ml-2">
                                          <span className="text-green-400">•</span> {line.substring(1).trim()}
                                        </div>
                                      );
                                    } else if (line.includes('**')) {
                                      // Inline bold text
                                      const parts = line.split('**');
                                      return (
                                        <div key={lineIdx} className="text-gray-200">
                                          {parts.map((part, partIdx) => 
                                            partIdx % 2 === 0 ? part : <span key={partIdx} className="font-bold text-green-200">{part}</span>
                                          )}
                                        </div>
                                      );
                                    } else {
                                      return (
                                        <div key={lineIdx} className="text-gray-200">
                                          {line}
                                        </div>
                                      );
                                    }
                                  })}
                                </div>
                              );
                            } else {
                              return (
                                <div key={idx} className="text-gray-200">
                                  {paragraph}
                                </div>
                              );
                            }
                          })}
                        </div>
                      ) : (
                        // Regular message formatting
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                      <span className="text-xs opacity-60 mt-2 block">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}

              {/* Quick Action Buttons - Show only when there's a welcome message and no user messages yet */}
              {messages.length === 1 && messages[0].id.startsWith('welcome-') && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-400 text-center">{CHATBOT_CONFIG.UI_TEXT.QUICK_QUESTIONS_LABEL}</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {CHATBOT_CONFIG.QUICK_QUESTIONS.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickQuestion(question)}
                        disabled={isLoading}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-gray-200 text-xs rounded-full transition-colors duration-200 border border-gray-600 hover:border-gray-500"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700 bg-gray-800">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={CHATBOT_CONFIG.UI_TEXT.INPUT_PLACEHOLDER}
                  disabled={isLoading}
                  className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AIChatbot;
