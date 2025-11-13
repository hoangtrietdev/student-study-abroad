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
5. **CRITICAL - Reference Links**: Add the referenceLink field to as many steps as possible
   - Put helpful URLs in the "referenceLink" field for each step (this creates a clickable link in the UI)
   - Prioritize links to ${university}'s official pages (admissions, program pages, student services, international office, etc.)
   - Include direct links to ${university}'s application portal, housing office, visa guidance pages
   - You can also mention relevant links within the step description text for context
   - For general resources, use reputable sources (government sites, official testing centers, visa portals)
   - Aim to provide referenceLink for every step where it would help the student

## Output Format
Return ONLY a valid JSON object with this EXACT structure (no markdown, no additional text):

{
  "title": "Roadmap for ${degreeLevel} in ${major} at ${university}",
  "overview": "Write 2-3 paragraphs explaining the personalized journey for this ${degreeLevel} student pursuing ${major} at ${university}. Make it motivating and specific to their goals.",
  "roadmapSections": [
    // Include ALL 9 sections from the template, customized for ${major} and ${university}
    // Each section MUST have: id, title, description, steps[], position{x,y}, color
    // Keep the same section IDs: choose-school, applying, immigration, transportation, housing, necessary-items, student-card, bank-account, orientation
  ]
}

CRITICAL: Return valid JSON matching the template structure with all 9 sections customized for ${major} at ${university}.`;
};

