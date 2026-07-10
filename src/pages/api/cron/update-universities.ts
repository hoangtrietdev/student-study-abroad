import type { NextApiRequest, NextApiResponse } from 'next';
import { execSync } from 'child_process';
import path from 'path';

/**
 * Cron job endpoint to refresh university data.
 * 
 * Triggered by Vercel Cron (see vercel.json) or called manually.
 * Secured by CRON_SECRET environment variable.
 *
 * Schedule: 1st of every month at 2:00 AM UTC
 *
 * Manual trigger:
 *   POST /api/cron/update-universities
 *   Authorization: Bearer <CRON_SECRET>
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Secure the endpoint
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  console.log('[Cron] Starting university data update...', new Date().toISOString());

  try {
    // Run the fetch script
    const scriptPath = path.join(process.cwd(), 'scripts', 'fetch-universities.ts');
    execSync(`npx tsx ${scriptPath}`, {
      env: {
        ...process.env,
        NODE_ENV: 'production',
      },
      timeout: 120000, // 2 minute timeout
      stdio: 'pipe',
    });

    const duration = Date.now() - startTime;
    console.log(`[Cron] University data updated successfully in ${duration}ms`);

    return res.status(200).json({
      success: true,
      message: 'University data updated successfully',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Failed to update university data:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update university data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
