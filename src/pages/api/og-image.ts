import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Set headers for better Facebook compatibility
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, immutable, no-transform, max-age=31536000');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    // Add Facebook-specific headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    
    // Generate SVG content optimized for Facebook
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1200" height="630" fill="#111827"/>
  
  <!-- Grid pattern -->
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1f2937" stroke-width="1" opacity="0.5"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#grid)"/>
  
  <!-- Left side - Title and description -->
  <text x="60" y="120" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#ffffff">
    Study Overseas
  </text>
  <text x="60" y="180" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#10b981">
    Roadmap
  </text>
  
  <text x="60" y="240" font-family="Arial, sans-serif" font-size="20" fill="#9ca3af">
    Interactive AI-powered guidance platform
  </text>
  <text x="60" y="270" font-family="Arial, sans-serif" font-size="20" fill="#9ca3af">
    for international students
  </text>
  
  <!-- Features -->
  <text x="60" y="330" font-family="Arial, sans-serif" font-size="16" fill="#60a5fa">
    ✓ 8-Stage Interactive Roadmap
  </text>
  <text x="60" y="360" font-family="Arial, sans-serif" font-size="16" fill="#60a5fa">
    ✓ AI Study Abroad Assistant
  </text>
  <text x="60" y="390" font-family="Arial, sans-serif" font-size="16" fill="#60a5fa">
    ✓ Progress Tracking &amp; Persistence
  </text>
  <text x="60" y="420" font-family="Arial, sans-serif" font-size="16" fill="#60a5fa">
    ✓ Bilingual Support (EN/VI)
  </text>
  
  <!-- Tech stack -->
  <text x="60" y="480" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">
    Built with Next.js • TypeScript • Supabase • AI
  </text>
  
  <!-- GitHub info -->
  <text x="60" y="550" font-family="Arial, sans-serif" font-size="14" fill="#4ade80">
    github.com/hoangtrietdev
  </text>
  
  <!-- Right side - Visual elements -->
  <!-- Roadmap nodes visualization -->
  <g transform="translate(650, 100)">
    <!-- University Research node -->
    <rect x="0" y="0" width="120" height="80" rx="8" fill="#d946ef" opacity="0.9"/>
    <text x="60" y="35" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle">University</text>
    <text x="60" y="50" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle">Research</text>
    <text x="60" y="65" font-family="Arial, sans-serif" font-size="10" fill="#e5e7eb" text-anchor="middle">100% Complete</text>
    
    <!-- Application node -->
    <rect x="150" y="0" width="120" height="80" rx="8" fill="#f97316" opacity="0.9"/>
    <text x="210" y="35" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle">Application</text>
    <text x="210" y="50" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle">Process</text>
    <text x="210" y="65" font-family="Arial, sans-serif" font-size="10" fill="#e5e7eb" text-anchor="middle">75% Complete</text>
    
    <!-- Immigration node -->
    <rect x="0" y="120" width="120" height="80" rx="8" fill="#3b82f6" opacity="0.9"/>
    <text x="60" y="155" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle">Immigration</text>
    <text x="60" y="170" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle">&amp; Visa</text>
    <text x="60" y="185" font-family="Arial, sans-serif" font-size="10" fill="#e5e7eb" text-anchor="middle">60% Complete</text>
    
    <!-- Housing node -->
    <rect x="150" y="120" width="120" height="80" rx="8" fill="#8b5cf6" opacity="0.9"/>
    <text x="210" y="155" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle">Housing</text>
    <text x="210" y="170" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle">Arrangements</text>
    <text x="210" y="185" font-family="Arial, sans-serif" font-size="10" fill="#e5e7eb" text-anchor="middle">25% Complete</text>
    
    <!-- Transportation node -->
    <rect x="75" y="240" width="120" height="80" rx="8" fill="#10b981" opacity="0.9"/>
    <text x="135" y="275" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle">Travel &amp;</text>
    <text x="135" y="290" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle">Transport</text>
    <text x="135" y="305" font-family="Arial, sans-serif" font-size="10" fill="#e5e7eb" text-anchor="middle">0% Complete</text>
    
    <!-- Connection lines -->
    <line x1="60" y1="80" x2="60" y2="120" stroke="#4b5563" stroke-width="2"/>
    <line x1="120" y1="40" x2="150" y2="40" stroke="#4b5563" stroke-width="2"/>
    <line x1="210" y1="80" x2="210" y2="120" stroke="#4b5563" stroke-width="2"/>
    <line x1="120" y1="160" x2="150" y2="160" stroke="#4b5563" stroke-width="2"/>
    <line x1="135" y1="200" x2="135" y2="240" stroke="#4b5563" stroke-width="2"/>
  </g>
  
  <!-- AI Assistant icon -->
  <g transform="translate(950, 400)">
    <circle cx="40" cy="40" r="35" fill="#059669" opacity="0.9"/>
    <text x="40" y="30" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle">AI</text>
    <text x="40" y="50" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle">Assistant</text>
    <circle cx="55" cy="25" r="4" fill="#10b981"/>
  </g>
  
  <!-- Decorative elements -->
  <circle cx="1000" cy="150" r="60" fill="none" stroke="#1f2937" stroke-width="2" opacity="0.5"/>
  <circle cx="1100" cy="250" r="40" fill="none" stroke="#1f2937" stroke-width="2" opacity="0.5"/>
  <circle cx="950" cy="300" r="25" fill="none" stroke="#1f2937" stroke-width="2" opacity="0.5"/>
</svg>`;

    // If you have Sharp installed (optional - uncomment if needed)
    /*
    const sharp = require('sharp');
    const buffer = Buffer.from(svg);
    const pngBuffer = await sharp(buffer)
      .png()
      .resize(1200, 630)
      .toBuffer();
    
    res.send(pngBuffer);
    */
    
    // For now, return SVG (most platforms support it)
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
    
  } catch (error) {
    console.error('Error generating OG image:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
}
