import type { NextApiRequest, NextApiResponse } from 'next';
import { generateCustomRoadmapPrompt } from '@/prompts/customRoadmapGenerator';
import { roadmapSections } from '@/constants/roadmap';

interface GenerateRoadmapRequest {
  university: string;
  universityWebsite?: string;
  degreeLevel: string;
  major: string;
  faculty?: string;
  userId: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers for development
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      university,
      universityWebsite,
      degreeLevel,
      major,
      faculty,
      userId,
    } = req.body as GenerateRoadmapRequest;

    // Validation
    if (!university || !degreeLevel || !major || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['Bachelor', 'Master', 'PhD'].includes(degreeLevel)) {
      return res.status(400).json({ error: 'Invalid degree level. Must be Bachelor, Master, or PhD' });
    }

    // Generate prompt
    const prompt = generateCustomRoadmapPrompt({
      university,
      universityWebsite,
      degreeLevel: degreeLevel as 'Bachelor' | 'Master' | 'PhD',
      major,
      faculty,
      templateRoadmap: roadmapSections,
    });

    console.log('Generating custom roadmap for:', { university, major, userId });

    // Check if API key is configured
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ 
        error: 'AI service not configured. Please add GROQ_API_KEY to your environment variables.'
      });
    }

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 8000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from Groq API');
    }

    const aiResponse = data.choices[0].message.content;
    
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse AI response
    let generatedRoadmap;
    try {
      generatedRoadmap = JSON.parse(aiResponse);
    } catch {
      console.error('Failed to parse AI response:', aiResponse.substring(0, 200));
      throw new Error('Failed to parse AI response as JSON');
    }

    // Return the generated roadmap data
    // The client will save it to Firebase with proper authentication
    const roadmapData = {
      userId,
      university,
      universityWebsite: universityWebsite || null,
      degreeLevel,
      major,
      faculty: faculty || null,
      isCustom: true,
      roadmapData: generatedRoadmap,
    };


    return res.status(200).json({ 
      roadmapData,
      message: 'Custom roadmap generated successfully'
    });

  } catch (error) {
    console.error('Error generating custom roadmap:', error);
    
    if (error instanceof Error) {
      // Provide specific error messages based on error type
      let statusCode = 500;
      let errorMessage = 'Failed to generate roadmap';
      let details = error.message;

      if (error.message.includes('Groq API error')) {
        errorMessage = 'AI service error';
        if (error.message.includes('429') || error.message.includes('rate limit')) {
          statusCode = 429;
          errorMessage = 'Too many requests';
          details = 'Please wait a moment and try again';
        } else if (error.message.includes('401') || error.message.includes('403')) {
          statusCode = 500;
          errorMessage = 'AI service authentication error';
          details = 'Service configuration issue';
        }
      } else if (error.message.includes('parse')) {
        errorMessage = 'AI response parsing error';
        details = 'The AI generated an invalid response. Please try again.';
      } else if (error.message.includes('Firebase') || error.message.includes('Firestore')) {
        errorMessage = 'Database error';
        details = 'Failed to save roadmap. Please try again.';
      }

      return res.status(statusCode).json({ 
        error: errorMessage, 
        details: details
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to generate roadmap',
      details: 'An unexpected error occurred. Please try again.'
    });
  }
}
