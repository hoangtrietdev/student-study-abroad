import type { NextApiRequest, NextApiResponse } from 'next';
import type { ExtractedProfile, GraphNode } from '@/types/simulation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { profile, goal, parentNode } = req.body as { 
    profile: ExtractedProfile; 
    goal: string; 
    parentNode: GraphNode;
  };

  if (!profile || !goal || !parentNode) {
    return res.status(400).json({ error: 'profile, goal, and parentNode are required.' });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'AI service not configured.' });
  }

  try {
    const prompt = `You are a career path graph generator.
A student is pursuing this goal: "${goal}"
They clicked on the broad concept/node: "${parentNode.label}" (ID: ${parentNode.id}).

Generate 3-5 specific, smaller sub-nodes that represent the exact skills, concepts, or certifications required to master "${parentNode.label}".

Generate a JSON object with EXACTLY this schema:
{
  "nodes": [
    {
      "id": "unique_snake_case_id",
      "parentId": "${parentNode.id}",
      "label": "Small sub-skill label (max 30 chars)",
      "type": "skill" | "certificate" | "action",
      "status": "missing" | "in_progress" | "have",
      "importance": number (1-10)
    }
  ],
  "edges": [
    {
      "id": "unique_edge_id",
      "source": "${parentNode.id}",
      "target": "new_node_id",
      "label": "REQUIRES" | "INCLUDES"
    }
  ],
  "nodeDetails": {
    "node_id": {
      "title": "Full title of sub-skill",
      "description": "Why this specifically matters",
      "steps": ["Step 1:...", "Step 2:...", "Step 3:..."]
    }
  }
}

Return ONLY valid JSON. No markdown fences.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a precise career path expander JSON API.' },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.5,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`Groq error ${response.status}: ${err?.error?.message ?? 'unknown'}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;
    const expandedGraph = JSON.parse(raw);

    return res.status(200).json(expandedGraph);
  } catch (error) {
    console.error('[expand-node]', error);
    return res.status(500).json({ error: 'Failed to expand node.' });
  }
}
