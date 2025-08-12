// Chatbot constants and configuration
export const CHATBOT_CONFIG = {
  BOT_NAME: 'StudyBot',
  SUPPORT_EMAIL: 'hoangtrietdev@gmail.com',
  WELCOME_MESSAGE: {
    TITLE: '👋 **Welcome to StudyBot!**',
    INTRO: "I'm your AI study abroad assistant, here to help you navigate your international education journey!",
    LANGUAGE_SUPPORT: '**Language Support:** 🌐\nI support both English and Vietnamese (Tiếng Việt). Vietnamese responses may be slightly slower, so please be patient!',
    DISCLAIMER: '⚠️ **Important:** Please verify all information provided as AI responses may not be 100% accurate. Always double-check important details!',
    CAPABILITIES_HEADER: '**I can help you with:**',
    CAPABILITIES: [
      'Study abroad programs & destinations 🌍',
      'University applications & requirements 📚',
      'Visa processes & documentation 📋',
      'Scholarship opportunities 💰',
      'Cultural adaptation tips 🏛️',
      'Language learning advice 🗣️',
      'Academic planning & course selection 🎓',
      'Living arrangements & budgeting 🏠'
    ],
    SUPPORT_HEADER: '**Need more support?**',
    SUPPORT_TEXT: 'For additional assistance, contributions, or further information, feel free to reach out to:',
    CLOSING: 'Go ahead and ask me anything about studying abroad! 😊'
  },
  QUICK_QUESTIONS: [
    "What are the best study abroad destinations?",
    "How do I apply for a student visa?",
    "What scholarships are available?",
    "How to choose the right university?"
  ],
  UI_TEXT: {
    HEADER_TITLE: 'AI Assistant',
    INPUT_PLACEHOLDER: 'Ask me anything...',
    CLEAR_CHAT_TOOLTIP: 'Clear chat',
    QUICK_QUESTIONS_LABEL: 'Quick questions to get started:',
    EMPTY_STATE: {
      TITLE: 'Welcome to StudyBot!',
      SUBTITLE: 'Your AI study abroad assistant is ready to help!',
      DESCRIPTION: "Click the chat to start or I'll show you some quick options."
    }
  },
  ERROR_MESSAGES: {
    GENERIC: 'Sorry, I encountered an error. Please try again.',
    NETWORK: 'Failed to get AI response'
  }
};

// Generate the full welcome message
export const generateWelcomeMessage = (): string => {
  const { WELCOME_MESSAGE } = CHATBOT_CONFIG;
  
  const capabilities = WELCOME_MESSAGE.CAPABILITIES
    .map(capability => `• ${capability}`)
    .join('\n');

  return `${WELCOME_MESSAGE.TITLE}

${WELCOME_MESSAGE.INTRO}

${WELCOME_MESSAGE.LANGUAGE_SUPPORT}

${WELCOME_MESSAGE.DISCLAIMER}

${WELCOME_MESSAGE.CAPABILITIES_HEADER}
${capabilities}

${WELCOME_MESSAGE.SUPPORT_HEADER}
${WELCOME_MESSAGE.SUPPORT_TEXT} **${CHATBOT_CONFIG.SUPPORT_EMAIL}**

${WELCOME_MESSAGE.CLOSING}`;
};
