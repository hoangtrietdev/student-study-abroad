import type { NextApiRequest, NextApiResponse } from 'next';
import { TRAVEL_REFINER_PROMPT } from '@/prompts/travelRefiner';
import { TravelRefineRequest } from '@/types/travel';

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
    const { message, history = [], plannerInput, activePlan, allPlans = [] } = req.body as TravelRefineRequest;

    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (isDisallowed(message)) {
      return res.status(200).json({
        message: "I can't assist with that. I can help refine travel plans, budget options, and itinerary ideas.",
        success: true,
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(200).json({
        message:
          'Travel AI is not configured yet. Please set GROQ_API_KEY. Meanwhile, try reducing accommodation category and using bus/train combinations for cheaper plans.',
        success: true,
      });
    }

    const contextMessage = {
      role: 'system' as const,
      content: `${TRAVEL_REFINER_PROMPT}\n\nCONTEXT:\n${JSON.stringify(
        {
          plannerInput,
          activePlan,
          allPlans: allPlans.slice(0, 3),
        },
        null,
        2
      )}`,
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 700,
        temperature: 0.65,
        top_p: 0.9,
        messages: [contextMessage, ...history.slice(-8), { role: 'user', content: message }],
      }),
    });

    if (!response.ok) {
      return res.status(500).json({ message: 'Failed to refine travel plan.', success: false });
    }

    const data = await response.json();
    const aiRaw = data?.choices?.[0]?.message?.content || '';
    const aiResponse = cleanAI(aiRaw);

    if (isDisallowed(aiResponse)) {
      return res.status(200).json({
        message: 'I can help with safe travel planning: reducing costs, improving comfort, and improving itinerary flow.',
        success: true,
      });
    }

    return res.status(200).json({ message: aiResponse, success: true });
  } catch (error) {
    console.error('Travel chat refine error:', error);
    return res.status(500).json({ message: 'Unable to process travel refinement right now.', success: false });
  }
}
