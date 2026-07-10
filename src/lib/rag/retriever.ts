import { loadUniversityChunks, COUNTRY_MAP, UniversityChunk } from './loader';

export interface RAGResult {
  content: string;
  sources: string[];
  confidence: number;
  isRelevant: boolean;
}

// Keywords that suggest a university/study-abroad RAG query
const STUDY_KEYWORDS = [
  // Ranking related
  'rank', 'ranking', 'top', 'best', 'world', 'rated', 'prestigious', 'elite',
  // University related
  'university', 'college', 'school', 'trường', 'đại học', 'học viện',
  // Scholarship related
  'scholarship', 'học bổng', 'funding', 'grant', 'fellowship', 'bursary', 'financial aid', 'tài trợ',
  // Tuition related
  'tuition', 'fee', 'học phí', 'cost', 'chi phí', 'phí', 'price',
  // Acceptance / Admission
  'acceptance', 'admission', 'apply', 'application', 'tuyển sinh', 'nộp hồ sơ',
  // Programs
  'program', 'course', 'major', 'degree', 'ngành', 'chương trình',
  // Countries (Vietnamese + English)
  'mỹ', 'anh', 'úc', 'canada', 'pháp', 'thụy sĩ', 'đức', 'đan mạch', 'thụy điển',
  'ireland', 'hàn', 'nhật', 'singapore', 'đài loan',
  'america', 'britain', 'australia', 'france', 'switzerland', 'germany',
  'denmark', 'sweden', 'japan', 'korea', 'taiwan',
];

// Scholarship-specific keywords for high-confidence boost
const SCHOLARSHIP_KEYWORDS = [
  'học bổng', 'scholarship', 'fellowship', 'grant', 'mext', 'kgsp', 'daad',
  'eiffel', 'gates', 'rhodes', 'chevening', 'si scholarship', 'mofa',
  'fully funded', 'full scholarship', 'free tuition', 'funded',
];

/**
 * Score a chunk against a query using keyword matching.
 * Returns a score from 0–100.
 */
function scoreChunk(chunk: UniversityChunk, query: string, queryLower: string): number {
  let score = 0;
  const countryCode = chunk.countryCode;
  const keywords = COUNTRY_MAP[`${countryCode}.md`] || [];
  const chunkLower = chunk.content.toLowerCase();

  // Country/University name mention in query
  for (const keyword of keywords) {
    if (queryLower.includes(keyword.toLowerCase())) {
      score += 20;
      break; // Only count country match once
    }
  }

  // Direct university name mention in query
  const uniNameLower = chunk.universityName.toLowerCase();
  if (uniNameLower !== chunk.country.toLowerCase() && queryLower.includes(uniNameLower.slice(0, 6))) {
    score += 40;
  }

  // Scholarship query boost for scholarship sections
  const isScholarshipQuery = SCHOLARSHIP_KEYWORDS.some(kw => queryLower.includes(kw));
  if (isScholarshipQuery && chunkLower.includes('scholarship')) {
    score += 25;
  }

  // Tuition query boost
  if ((queryLower.includes('học phí') || queryLower.includes('tuition') || queryLower.includes('fee') || queryLower.includes('cost')) 
      && chunkLower.includes('tuition')) {
    score += 15;
  }

  // Ranking query — prefer highly ranked universities
  if ((queryLower.includes('rank') || queryLower.includes('ranking') || queryLower.includes('top') || queryLower.includes('tốt nhất') || queryLower.includes('best'))
      && chunk.rank) {
    const rankNum = parseInt(chunk.rank.replace('#', '').split('–')[0]);
    if (!isNaN(rankNum)) {
      if (rankNum <= 50) score += 20;
      else if (rankNum <= 100) score += 15;
      else if (rankNum <= 200) score += 10;
      else score += 5;
    }
  }

  // General info note sections get lower score unless country is matched
  if (chunk.universityName === chunk.country && score > 0) {
    score -= 5; // Slightly deprioritize general notes unless country matched
  }

  return Math.min(score, 100);
}

/**
 * Detect if a query is relevant to university/study-abroad information.
 */
function isStudyQuery(queryLower: string): boolean {
  return STUDY_KEYWORDS.some(kw => queryLower.includes(kw));
}

/**
 * Main RAG retrieval function.
 * Given a user query, returns the most relevant university information chunks.
 *
 * @param query - The user's message
 * @param maxChunks - Max number of chunks to return (default: 3)
 * @param maxTokens - Approximate max characters of context (default: 3000)
 */
export function retrieveContext(query: string, maxChunks = 3, maxTokens = 3000): RAGResult {
  const queryLower = query.toLowerCase();

  // Quick check if this looks like a study-abroad query
  if (!isStudyQuery(queryLower)) {
    return {
      content: '',
      sources: [],
      confidence: 0,
      isRelevant: false,
    };
  }

  const chunks = loadUniversityChunks();
  if (chunks.length === 0) {
    return {
      content: '',
      sources: [],
      confidence: 0,
      isRelevant: false,
    };
  }

  // Score all chunks
  const scored = chunks
    .map(chunk => ({ chunk, score: scoreChunk(chunk, query, queryLower) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return {
      content: '',
      sources: [],
      confidence: 0,
      isRelevant: false,
    };
  }

  // Select top chunks up to token limit
  const selected: UniversityChunk[] = [];
  let totalChars = 0;
  const seenUniversities = new Set<string>();

  for (const { chunk, score } of scored) {
    if (selected.length >= maxChunks) break;
    if (totalChars + chunk.content.length > maxTokens) {
      // Try to fit a trimmed version
      const remaining = maxTokens - totalChars;
      if (remaining < 200) break; // Not enough space left
    }

    // Avoid duplicate universities
    const uniKey = `${chunk.countryCode}-${chunk.universityName}`;
    if (seenUniversities.has(uniKey)) continue;
    seenUniversities.add(uniKey);

    selected.push(chunk);
    totalChars += chunk.content.length;
  }

  if (selected.length === 0) {
    return { content: '', sources: [], confidence: 0, isRelevant: false };
  }

  const topScore = scored[0].score;
  const confidence = Math.min(topScore / 100, 1);

  const content = selected
    .map(chunk => chunk.content)
    .join('\n\n---\n\n');

  const sources = selected
    .filter(c => c.universityName !== c.country)
    .map(c => `${c.universityName} (${c.country} ${c.rank})`.trim());

  return {
    content,
    sources,
    confidence,
    isRelevant: confidence > 0.15,
  };
}

/**
 * Retrieve ALL universities for a given country code.
 * Used when user explicitly asks about a specific country.
 */
export function retrieveByCountry(countryCode: string): RAGResult {
  const chunks = loadUniversityChunks();
  const countryChunks = chunks.filter(c => c.countryCode === countryCode);

  if (countryChunks.length === 0) {
    return { content: '', sources: [], confidence: 0, isRelevant: false };
  }

  const content = countryChunks.map(c => c.content).join('\n\n---\n\n');
  const sources = countryChunks
    .filter(c => c.universityName !== c.country)
    .map(c => `${c.universityName} ${c.rank}`.trim());

  return {
    content: content.slice(0, 4000), // Cap at 4000 chars
    sources,
    confidence: 1.0,
    isRelevant: true,
  };
}
