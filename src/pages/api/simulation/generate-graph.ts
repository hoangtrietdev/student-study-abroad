import type { NextApiRequest, NextApiResponse } from 'next';
import { buildGraphGenerationMessages } from '@/prompts/simulationPrompts';
import type { ExtractedProfile } from '@/types/simulation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { profile, goal } = req.body as { profile: ExtractedProfile; goal: string };

  if (!profile || !goal || typeof goal !== 'string' || goal.trim().length < 5) {
    return res.status(400).json({ error: 'profile and goal are required.' });
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
        messages: buildGraphGenerationMessages(profile, goal),
        model: 'llama-3.3-70b-versatile',
        temperature: 0.5,
        max_tokens: 8000,
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

    const graph = JSON.parse(raw);

    // Basic validation
    if (!Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
      throw new Error('Invalid graph structure returned from AI.');
    }

    return res.status(200).json({ graph });
  } catch (error) {
    console.error('[generate-graph]', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate graph.',
    });
  }
}
