import type { ExtractedProfile } from '@/types/simulation';

export function buildCvExtractionPrompt(cvText: string): string {
  return `You are a CV/resume parsing expert. Extract structured information from the following CV text and return ONLY a valid JSON object matching the schema below. Do not add any explanation or markdown fences.

Schema:
{
  "name": "string or null",
  "skills": ["array of technical and soft skills"],
  "education": [
    { "school": "string", "degree": "string", "field": "string or null", "year": "string or null" }
  ],
  "certificates": [
    { "name": "string", "issuer": "string or null", "year": "string or null" }
  ],
  "connections": ["list of notable people, professors, mentors, companies they have worked with"],
  "languages": ["spoken/written languages"],
  "summary": "2–3 sentence professional summary extracted from the CV"
}

Rules:
- skills: include programming languages, frameworks, tools, methodologies, and soft skills
- education: include all institutions, degrees and relevant courses
- certificates: include online courses, professional certificates, awards
- connections: extract names of professors, supervisors, colleagues, companies
- If a field has no data, return an empty array [] or null
- Return ONLY the JSON object, no markdown, no explanation

CV TEXT:
---
${cvText.slice(0, 12000)}
---`;
}

export function buildCvExtractionMessages(cvText: string) {
  return [
    {
      role: 'system' as const,
      content:
        'You are a precise CV parsing assistant. You output only valid JSON, no markdown fences, no commentary.',
    },
    {
      role: 'user' as const,
      content: buildCvExtractionPrompt(cvText),
    },
  ];
}

export function buildGraphGenerationPrompt(
  profile: ExtractedProfile,
  goal: string
): string {
  return `You are a career path graph generator for students studying or working abroad. Given a student profile and their goal, generate a knowledge graph that shows the connections between what they have and what they need to achieve their goal.

STUDENT PROFILE:
${JSON.stringify(profile, null, 2)}

STUDENT GOAL:
${goal}

Generate a JSON object with this EXACT schema (no markdown, no explanation):
{
  "nodes": [
    {
      "id": "unique_snake_case_id",
      "parentId": "optional_parent_node_id_if_this_is_a_sub_skill",
      "label": "Human-readable label (max 30 chars)",
      "type": "one of: skill | school | certificate | connection | job | goal | action",
      "status": "one of: have | missing | in_progress | target",
      "importance": number between 1 and 10
    }
  ],
  "edges": [
    {
      "id": "unique_edge_id",
      "source": "node_id",
      "target": "node_id",
      "label": "short relationship label e.g. SUPPORTS, REQUIRES, LEADS_TO, RECOMMENDS"
    }
  ],
  "nodeDetails": {
    "node_id": {
      "title": "Full title",
      "description": "1-2 sentence description of why this matters for the goal",
      "steps": ["Step 1: …", "Step 2: …", "Step 3: …"]
    }
  }
}

Rules:
- Always include exactly 1 node with type "goal" representing the student's goal (status: "target")
- Nodes the student already has → status: "have"
- Nodes they need and don't have → status: "missing"
- Nodes they are working on → status: "in_progress"
- IMPORTANT: Conceptualize Universities/Schools heavily around the dimension of "Culture and Networking" (use 'connection' type or strongly link to connection nodes).
- HIERARCHY: For broad technical skills (e.g. AWS), create a main node, and then generate 3-5 sub-nodes (e.g., Cloud Computing, Architecture, Certifications) mapped to the main node using the "parentId" field. YOU MUST ALSO CREATE AN EDGE connecting the child to the parent. Actionable 'steps' should be defined on the sub-nodes, rather than the parent node.
- Generate 15–30 nodes total.
- Every node MUST appear in at least one edge (except sub-nodes, which are implicitly linked to their parents; however, they can still have edges).
- nodeDetails MUST include an entry for EVERY node id
- steps array: 3–6 concrete, actionable steps for that node (parents can have empty steps [] if their children carry the workload).
- Return ONLY the JSON object`;
}

export function buildGraphGenerationMessages(
  profile: ExtractedProfile,
  goal: string
) {
  return [
    {
      role: 'system' as const,
      content:
        'You are a precise career graph generator. You output only valid JSON, no markdown fences, no commentary.',
    },
    {
      role: 'user' as const,
      content: buildGraphGenerationPrompt(profile, goal),
    },
  ];
}
