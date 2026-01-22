import { RoadmapSection } from "@/constants/roadmap";

export interface CustomRoadmapInput {
  university: string;
  universityWebsite?: string;
  degreeLevel: "Bachelor" | "Master" | "PhD";
  major: string;
  faculty?: string;
  templateRoadmap: RoadmapSection[];
}

export const generateCustomRoadmapPrompt = (
  input: CustomRoadmapInput
): string => {
  const {
    university,
    universityWebsite,
    degreeLevel,
    major,
    faculty,
    templateRoadmap,
  } = input;

  return `You are an expert study abroad advisor creating a personalized roadmap for international students.

## Student Profile
- **Target University:** ${university}${universityWebsite ? ` (${universityWebsite})` : ''}
- **Degree Level:** ${degreeLevel}
- **Desired Major:** ${major}${faculty ? ` - ${faculty} Faculty` : ''}

## Template Roadmap Structure
You have access to this proven 9-section framework:
${JSON.stringify(templateRoadmap, null, 2)}

## Your Task
Customize the 9 roadmap sections above specifically for a ${degreeLevel} student pursuing ${major} at ${university}.

For each section:
1. Keep the EXACT same structure: id, title, description, steps array, position, color
2. Customize the title to mention the student's major or university where relevant
   - **IMPORTANT**: Keep titles SHORT (max 5-7 words) so they fit in the visual blocks
   - Example: "University Research & Selection" NOT "University Research & Selection for Master in Computer Science at University of Pecs"
   - Avoid repeating university name in every title - be concise
3. Rewrite the description to be specific to ${university} and ${major}
4. For each step: keep same count, customize content for this profile, keep optional field

## CRITICAL RULES - Data Accuracy & Reference Links

### Reference Links Policy:
- **ONLY include referenceLink if you have a REAL, ACCURATE URL**
- **DO NOT generate fake or placeholder links (e.g., no "https://example.com" or made-up URLs)**
- **DO NOT hallucinate URLs** - if you don't know the actual link, LEAVE IT OUT
- Prioritize ${university}'s official pages when you know them (admissions, program pages, international office)
- Use verified government sites for visa/immigration steps (official embassy/consulate sites)
- Use official testing organization sites (IELTS, TOEFL, GRE official sites)
- If you don't know the exact URL for a step, simply omit the referenceLink field - it's better to have no link than a fake one

### Content Accuracy:
- **Base your advice on REAL requirements and procedures** for ${university} if you have that knowledge
- **If you don't have specific information** about ${university}, provide GENERAL but ACCURATE study abroad advice
- **DO NOT make up specific deadlines, requirements, or procedures** you don't know
- Use phrases like "Check university website for specific deadlines" rather than inventing dates
- Provide accurate, helpful guidance that applies broadly to ${degreeLevel} students in ${major}

### Quality Standards:
- Each step should be actionable and clear
- Descriptions should be informative but concise
- Optional steps should genuinely be optional, not critical requirements
- Maintain the logical flow from the template (research → apply → prepare → arrive → settle)

## Output Format
Return ONLY a valid JSON object with this EXACT structure (no markdown, no additional text):

{
  "title": "Roadmap for ${degreeLevel} in ${major} at ${university}",
  "overview": "Write 2-3 paragraphs explaining the personalized journey for this ${degreeLevel} student pursuing ${major} at ${university}. Make it motivating, specific, and based on accurate information about the program and university.",
  "roadmapSections": [
    // Include ALL 9 sections from the template, customized for ${major} and ${university}
    // Each section MUST have: id, title, description, steps[], position{x,y}, color
    // Each step can optionally have: title, description, optional (boolean), referenceLink (ONLY if you have a REAL URL)
    // Keep the same section IDs: choose-school, applying, immigration, transportation, housing, necessary-items, student-card, bank-account, orientation
  ]
}

**REMEMBER:** 
- Only include referenceLink fields with REAL, VERIFIABLE URLs
- DO NOT make up or hallucinate links
- If unsure about a link, LEAVE IT OUT
- Provide accurate, helpful content even without specific links
- It's better to have fewer accurate links than many fake ones

CRITICAL: Return valid JSON matching the template structure with all 9 sections customized for ${major} at ${university}.`;
};

