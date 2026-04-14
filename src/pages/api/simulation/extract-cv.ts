import type { NextApiRequest, NextApiResponse } from 'next';
import { buildCvExtractionMessages } from '@/prompts/simulationPrompts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { cvText } = req.body as { cvText: string };

  if (!cvText || typeof cvText !== 'string' || cvText.trim().length < 50) {
    return res.status(400).json({ error: 'cvText is required and must be at least 50 characters.' });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'AI service not configured.' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: buildCvExtractionMessages(cvText),
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        max_tokens: 6000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`Groq error ${response.status}: ${err?.error?.message ?? 'unknown'}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) throw new Error('Empty response from Groq');

    const profile = JSON.parse(raw);
    return res.status(200).json({ profile });
  } catch (error) {
    console.error('[extract-cv]', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to extract CV data.',
    });
  }
}
