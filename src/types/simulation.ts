export type NodeType =
  | 'skill'
  | 'school'
  | 'certificate'
  | 'connection'
  | 'job'
  | 'goal'
  | 'action';

export const NODE_COLORS: Record<NodeType, string> = {
  skill: '#F97316',
  school: '#3B82F6',
  certificate: '#14B8A6',
  connection: '#8B5CF6',
  job: '#22C55E',
  goal: '#EAB308',
  action: '#6B7280',
};

export const NODE_LABELS: Record<NodeType, string> = {
  skill: 'Skill',
  school: 'School',
  certificate: 'Certificate',
  connection: 'Connection',
  job: 'Job / Opportunity',
  goal: 'Your Goal',
  action: 'Action Required',
};

export type NodeStatus = 'have' | 'missing' | 'in_progress' | 'target';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  status: NodeStatus;
  parentIds?: string[];
  /** Relative importance 1-10; drives radius size */
  importance?: number;
  // D3 force sim runtime fields (populated by GraphCanvas)
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface NodeDetail {
  title: string;
  description?: string;
  steps: string[];
}

export interface SimulationGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  nodeDetails: Record<string, NodeDetail>;
}

export interface EducationEntry {
  school: string;
  degree: string;
  field?: string;
  year?: string;
}

export interface CertificateEntry {
  name: string;
  issuer?: string;
  year?: string;
}

export interface ExtractedProfile {
  name?: string;
  skills: string[];
  education: EducationEntry[];
  certificates: CertificateEntry[];
  connections: string[];
  languages?: string[];
  summary?: string;
}

export interface SimulationDoc {
  id: string;
  userId: string;
  goal: string;
  profile: ExtractedProfile;
  graph: SimulationGraph;
  completedNodes: string[];
  completedSteps: Record<string, boolean[]>; // nodeId → per-step boolean array
  createdAt: { seconds: number; nanoseconds: number };
  updatedAt: { seconds: number; nanoseconds: number };
}
