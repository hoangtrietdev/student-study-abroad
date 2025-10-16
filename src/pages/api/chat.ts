import { NextApiRequest, NextApiResponse } from 'next';
import { STUDY_ABROAD_ADVISOR_PROMPT } from '@/prompts/studyAbroadAdvisor';

// Very simple keyword-based moderation as a safety net (not a substitute for full moderation)
const BLOCKED_PATTERNS = [
  /(hate|racis\w+|sexist|violence|terror|extremis\w+)/i,
  /(adult content|porn|explicit sexual)/i,
  /(weapons|illegal drugs|buy fake)/i,
];

function isDisallowed(text: string): boolean {
  return BLOCKED_PATTERNS.some((re) => re.test(text));
}

function cleanAI(content: string): string {
  return content
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '')
    .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
    .replace(/<analysis>[\s\S]*?<\/analysis>/gi, '')
    .trim();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Basic server-side moderation of user input
    if (isDisallowed(String(message))) {
      return res.status(200).json({
        message: 'I can\'t assist with that topic. Let\'s focus on study abroad, visas, universities, or scholarships.',
        success: true,
      });
    }

    // Check if API key is configured
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ 
        message: 'AI service not configured. Please add GROQ_API_KEY to your environment variables.',
        success: false 
      });
    }

    // Prepare messages for Groq API
    const messages = [
      { 
        role: 'system', 
        content: STUDY_ABROAD_ADVISOR_PROMPT
      },
      ...history.slice(-10), // Keep last 10 messages for context (to stay within token limits)
      { role: 'user', content: message }
    ];

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model: 'llama-3.3-70b-versatile', // Updated to supported model
        max_tokens: 512, // Reasonable response length
        temperature: 0.7, // Balanced creativity
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
      }),
    });
  
    if (!response.ok) {
      console.error('Groq API response not ok:', response);
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from Groq API');
    }

    const aiRaw = data.choices[0].message.content || '';
    const aiResponse = cleanAI(aiRaw);

    // Basic server-side moderation of AI output
    if (isDisallowed(aiResponse)) {
      return res.status(200).json({
        message: 'Here\'s a safer alternative: I can help with study pathways, application steps, visa checklists, and scholarship strategies.',
        success: true,
      });
    }

    res.status(200).json({ 
      message: aiResponse,
      success: true,
      usage: data.usage // Optional: track token usage
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Provide helpful error messages
    let errorMessage = 'Sorry, I encountered an error. Please try again.';
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'AI service configuration error. Please contact support.';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
    }

    res.status(500).json({ 
      message: errorMessage,
      success: false 
    });
  }
}
