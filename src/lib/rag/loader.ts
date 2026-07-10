import fs from 'fs';
import path from 'path';

export interface UniversityChunk {
  country: string;
  countryCode: string;
  content: string;
  universityName: string;
  rank: string;
}

const COUNTRY_MAP: Record<string, string[]> = {
  'us.md': ['US', 'USA', 'United States', 'America', 'MIT', 'Harvard', 'Stanford', 'Caltech', 'Princeton', 'Cornell', 'Yale', 'Chicago', 'Johns Hopkins', 'UPenn', 'American'],
  'uk.md': ['UK', 'United Kingdom', 'Britain', 'England', 'Oxford', 'Cambridge', 'Imperial', 'UCL', 'Edinburgh', 'KCL', 'LSE', 'Manchester', 'Bristol', 'Warwick', 'British'],
  'australia.md': ['Australia', 'Australian', 'Melbourne', 'Sydney', 'UNSW', 'ANU', 'Monash', 'UQ', 'Queensland', 'UWA', 'Adelaide', 'UTS', 'Macquarie', 'Úc'],
  'canada.md': ['Canada', 'Canadian', 'Toronto', 'McGill', 'UBC', 'British Columbia', 'Alberta', 'Waterloo', 'McMaster', 'Ottawa', 'Western', 'Queens', 'SFU', 'Canada'],
  'france.md': ['France', 'French', 'PSL', 'Sorbonne', 'Polytechnique', 'HEC', 'Sciences Po', 'Grenoble', 'Paris', 'CentraleSupélec', 'ESSEC', 'Pháp'],
  'switzerland.md': ['Switzerland', 'Swiss', 'ETH', 'EPFL', 'Zurich', 'Lausanne', 'Basel', 'Geneva', 'Bern', 'Fribourg', 'Thụy Sĩ', 'Thuy Si'],
  'germany.md': ['Germany', 'German', 'TUM', 'Munich', 'LMU', 'Heidelberg', 'RWTH', 'Aachen', 'KIT', 'Karlsruhe', 'Berlin', 'Hamburg', 'Freiburg', 'Frankfurt', 'Đức', 'Duc'],
  'denmark.md': ['Denmark', 'Danish', 'Copenhagen', 'DTU', 'Aarhus', 'CBS', 'SDU', 'Aalborg', 'ITU', 'Roskilde', 'Đan Mạch', 'Dan Mach'],
  'sweden.md': ['Sweden', 'Swedish', 'KTH', 'Lund', 'Uppsala', 'Stockholm', 'Chalmers', 'Karolinska', 'Gothenburg', 'Linköping', 'Umeå', 'SSE', 'Thụy Điển', 'Thuy Dien'],
  'ireland.md': ['Ireland', 'Irish', 'Trinity', 'TCD', 'UCD', 'UCC', 'Galway', 'Limerick', 'DCU', 'Maynooth', 'Dublin', 'Cork', 'Ireland'],
  'south-korea.md': ['Korea', 'Korean', 'South Korea', 'SNU', 'Seoul', 'Yonsei', 'KAIST', 'SKKU', 'Sungkyunkwan', 'POSTECH', 'Hanyang', 'Ewha', 'Sogang', 'Hàn', 'Han Quoc', 'SKY'],
  'japan.md': ['Japan', 'Japanese', 'Tokyo', 'Kyoto', 'Osaka', 'Tohoku', 'Tokyo Tech', 'Nagoya', 'Keio', 'Waseda', 'Kyushu', 'Hokkaido', 'Todai', 'MEXT', 'Nhật', 'Nhat'],
  'singapore.md': ['Singapore', 'Singaporean', 'NUS', 'NTU', 'SMU', 'SUTD', 'SIT', 'SUSS', 'Nanyang', 'Singapore'],
  'taiwan.md': ['Taiwan', 'Taiwanese', 'NTU', 'NTHU', 'NYCU', 'NCKU', 'NSYSU', 'NTNU', 'TMU', 'NCCU', 'Tamkang', 'Tsinghua', 'TSMC', 'Đài Loan', 'Dai Loan'],
};

let cachedChunks: UniversityChunk[] | null = null;

function getDataDir(): string {
  return path.join(process.cwd(), 'data', 'universities');
}

/**
 * Load and parse all university markdown files into chunks.
 * Chunks are split by university entry (## heading) for granular retrieval.
 */
export function loadUniversityChunks(): UniversityChunk[] {
  if (cachedChunks) return cachedChunks;

  const dataDir = getDataDir();
  if (!fs.existsSync(dataDir)) {
    console.warn('[RAG] University data directory not found:', dataDir);
    return [];
  }

  const chunks: UniversityChunk[] = [];

  for (const [filename, _keywords] of Object.entries(COUNTRY_MAP)) {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
      console.warn('[RAG] File not found:', filePath);
      continue;
    }

    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const countryCode = filename.replace('.md', '');
    
    // Extract country name from first heading
    const countryMatch = rawContent.match(/# Top Universities in (.+)/);
    const country = countryMatch ? countryMatch[1].trim() : countryCode;

    // Split by ## headings (each university is a section)
    const sections = rawContent.split(/\n(?=## )/);
    
    for (const section of sections) {
      if (!section.trim()) continue;
      
      // Extract university name and rank from heading
      const headingMatch = section.match(/^## \d+\. (.+)/);
      if (!headingMatch) {
        // This is likely the header section (General Notes, Quick Comparison)
        // Include it as a country-level chunk
        chunks.push({
          country,
          countryCode,
          content: section.trim(),
          universityName: country,
          rank: '',
        });
        continue;
      }
      
      const universityName = headingMatch[1].trim();
      const rankMatch = section.match(/\*\*QS World Rank\*\*:?\s*#?(\d+[–\-]?\d*|\d+)/);
      const rank = rankMatch ? `#${rankMatch[1]}` : '';

      chunks.push({
        country,
        countryCode,
        content: section.trim(),
        universityName,
        rank,
      });
    }
  }

  cachedChunks = chunks;
  return chunks;
}

/**
 * Get the full content of a specific country file.
 */
export function getCountryContent(countryCode: string): string | null {
  const dataDir = getDataDir();
  const filePath = path.join(dataDir, `${countryCode}.md`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Get all country codes with available data files.
 */
export function getAvailableCountries(): string[] {
  const dataDir = getDataDir();
  if (!fs.existsSync(dataDir)) return [];
  return fs.readdirSync(dataDir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));
}

export { COUNTRY_MAP };
