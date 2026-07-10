#!/usr/bin/env tsx
/**
 * scripts/fetch-universities.ts
 *
 * Fetches/refreshes university data for all 14 target countries.
 * Currently uses a curated static dataset from QS World University Rankings 2025.
 * Can be extended to fetch from SerpAPI or QS API when available.
 *
 * Usage:
 *   npx tsx scripts/fetch-universities.ts             # Full update
 *   npx tsx scripts/fetch-universities.ts --dry-run   # Preview only (no writes)
 *   npx tsx scripts/fetch-universities.ts --country us # Update single country
 *
 * Run via npm: npm run fetch-universities
 */

import fs from 'fs';
import path from 'path';

const isDryRun = process.argv.includes('--dry-run');
const countryFilter = (() => {
  const idx = process.argv.indexOf('--country');
  return idx >= 0 ? process.argv[idx + 1] : null;
})();

const DATA_DIR = path.join(process.cwd(), 'data', 'universities');

interface CountryConfig {
  code: string;
  name: string;
  filename: string;
  emoji: string;
}

const COUNTRIES: CountryConfig[] = [
  { code: 'us', name: 'United States', filename: 'us.md', emoji: '🇺🇸' },
  { code: 'uk', name: 'United Kingdom', filename: 'uk.md', emoji: '🇬🇧' },
  { code: 'australia', name: 'Australia', filename: 'australia.md', emoji: '🇦🇺' },
  { code: 'canada', name: 'Canada', filename: 'canada.md', emoji: '🇨🇦' },
  { code: 'france', name: 'France', filename: 'france.md', emoji: '🇫🇷' },
  { code: 'switzerland', name: 'Switzerland', filename: 'switzerland.md', emoji: '🇨🇭' },
  { code: 'germany', name: 'Germany', filename: 'germany.md', emoji: '🇩🇪' },
  { code: 'denmark', name: 'Denmark', filename: 'denmark.md', emoji: '🇩🇰' },
  { code: 'sweden', name: 'Sweden', filename: 'sweden.md', emoji: '🇸🇪' },
  { code: 'ireland', name: 'Ireland', filename: 'ireland.md', emoji: '🇮🇪' },
  { code: 'south-korea', name: 'South Korea', filename: 'south-korea.md', emoji: '🇰🇷' },
  { code: 'japan', name: 'Japan', filename: 'japan.md', emoji: '🇯🇵' },
  { code: 'singapore', name: 'Singapore', filename: 'singapore.md', emoji: '🇸🇬' },
  { code: 'taiwan', name: 'Taiwan', filename: 'taiwan.md', emoji: '🇹🇼' },
];

/**
 * Update the "Last updated" date in a markdown file's header.
 */
function updateLastUpdated(content: string, date: string): string {
  return content.replace(
    /> \*\*Last updated\*\*: .+? \|/,
    `> **Last updated**: ${date} |`
  );
}

/**
 * Optionally fetch supplemental data from SerpAPI.
 * Falls back to static update (date refresh) if no API key is set.
 */
async function fetchSupplementalData(countryName: string): Promise<string | null> {
  const serpApiKey = process.env.SERP_API_KEY;
  if (!serpApiKey) {
    return null; // No API key — use static data only
  }

  try {
    const query = encodeURIComponent(`top 10 universities in ${countryName} QS ranking 2025 scholarships`);
    const url = `https://serpapi.com/search.json?q=${query}&engine=google&api_key=${serpApiKey}&num=5`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json() as { organic_results?: Array<{ title?: string; snippet?: string }> };
    const results = data.organic_results?.slice(0, 3) || [];
    
    if (results.length === 0) return null;

    // Format search results as supplemental context
    const supplemental = results
      .map((r) => `- ${r.title}: ${r.snippet}`)
      .join('\n');
    
    return supplemental;
  } catch (err) {
    console.warn(`  ⚠ SerpAPI fetch failed for ${countryName}:`, err);
    return null;
  }
}

async function processCountry(country: CountryConfig): Promise<void> {
  const filePath = path.join(DATA_DIR, country.filename);
  const today = new Date().toISOString().split('T')[0];

  console.log(`\n${country.emoji} Processing ${country.name}...`);

  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠ File not found: ${filePath}. Skipping.`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // Update the last-updated date in the file header
  const updated = updateLastUpdated(content, today);

  // Try to fetch supplemental data from SerpAPI (optional)
  const supplemental = await fetchSupplementalData(country.name);
  if (supplemental) {
    console.log(`  ✓ Supplemental data fetched from SerpAPI for ${country.name}`);
    // TODO: Integrate supplemental data into markdown (future enhancement)
    // For now, just log it
  }

  if (isDryRun) {
    console.log(`  [DRY RUN] Would update ${country.filename} with date: ${today}`);
    return;
  }

  fs.writeFileSync(filePath, updated, 'utf-8');
  console.log(`  ✓ Updated ${country.filename} — Last updated: ${today}`);
}

async function main(): Promise<void> {
  console.log('🎓 University Data Fetcher');
  console.log('==========================');
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE UPDATE'}`);
  console.log(`Data directory: ${DATA_DIR}`);
  
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`❌ Data directory not found: ${DATA_DIR}`);
    console.error('   Please run this script from the project root.');
    process.exit(1);
  }

  const toProcess = countryFilter
    ? COUNTRIES.filter(c => c.code === countryFilter)
    : COUNTRIES;

  if (toProcess.length === 0) {
    console.error(`❌ Country '${countryFilter}' not found. Valid codes: ${COUNTRIES.map(c => c.code).join(', ')}`);
    process.exit(1);
  }

  console.log(`\nProcessing ${toProcess.length} countr${toProcess.length === 1 ? 'y' : 'ies'}...`);

  for (const country of toProcess) {
    await processCountry(country);
  }

  console.log('\n✅ Done!');
  
  if (!isDryRun) {
    const timestamp = new Date().toISOString();
    const logPath = path.join(DATA_DIR, '.last-fetch.json');
    fs.writeFileSync(logPath, JSON.stringify({ 
      lastFetch: timestamp, 
      countries: toProcess.map(c => c.code)
    }, null, 2));
    console.log(`📝 Fetch log written to ${logPath}`);
  }
}

main().catch((err) => {
  console.error('❌ Fetch failed:', err);
  process.exit(1);
});
