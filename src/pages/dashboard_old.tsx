// pages/roadmap.tsx
import StyledModal from "@/components/Modal";
import { RoadmapSection } from "@/constants/roadmap";
import { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useRoadmap } from '@/hooks/useRoadmap';
import LoadingSpinner from "@/components/LoadingSpinner";

// Custom Node Component for better rendering
interface RoadmapNodeData {
  section: RoadmapSection;
  percentage: number;
  style: {
    background: string;
    color: string;
    padding: string;
    borderRadius: string;
    textAlign: "center";
    minWidth: string;
  };
}

const RoadmapNode = ({ data }: { data: RoadmapNodeData }) => {
  const { section, percentage, style } = data;
  
  return (
    <div style={style}>
      <div className="font-semibold">{section.title}</div>
      <div className="w-full h-2 bg-gray-200 rounded mt-2">
        <div
          className="h-2 bg-green-400 rounded"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
};

// Register custom node type
const nodeTypes = {
  roadmapNode: RoadmapNode,
};

export default function RoadmapPage() {
  const { user, loading: authLoading, isGuestMode, signOut } = useAuth();
  const router = useRouter();
  const { nodes, edges, progress, loading, loadRoadmap, handleToggle, getSection, hasLoaded } = useRoadmap(user, isGuestMode);
  const [selectedSection, setSelectedSection] = useState<RoadmapSection | null>(null);

  // Load data when component mounts or auth state changes
  useEffect(() => {
    if (!authLoading && !hasLoaded) {
      loadRoadmap();
    }
  }, [authLoading, hasLoaded, loadRoadmap]);

  const handleSignOut = async () => {
    await signOut();
    router.reload(); // Reload to reset state
  };

  // Transform nodes to use custom node type
  const transformedNodes = nodes.map(node => ({
    ...node,
    type: 'roadmapNode'
  }));

  const onNodeClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_: any, node: Node) => {
      const section = getSection(node.id);
      if (section) setSelectedSection(section);
    },
    [getSection]
  );

  const handleChecklistChange = (sectionId: string, stepIndex: number) => {
    handleToggle(sectionId, stepIndex);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1e1e1e]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-[#1e1e1e] shadow-lg border-b border-gray-700 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-white">Student Roadmap</h1>
          {user ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-300 border border-green-700/50">
              Signed in as {user.email}
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700/50 text-gray-300 border border-gray-600/50">
              Guest Mode - Progress saved locally
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {user ? (
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-400 hover:text-gray-200 transition-colors duration-200 px-3 py-1 rounded-md hover:bg-gray-700/50"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md"
            >
              Sign In to Save Progress
            </button>
          )}
        </div>
      </div>

      {/* Roadmap Content */}
      <div className="flex-1 bg-[#1e1e1e]" style={{ height: '100%', width: '100%' }}>
        <div style={{ height: '100vh', width: '100%' }}>
          <ReactFlow
            nodes={transformedNodes}
            edges={edges}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{
              padding: 0.2,
              includeHiddenNodes: false,
            }}
            style={{ background: "#1e1e1e" }}
            className="roadmap-flow"
            elementsSelectable={false}
            nodesConnectable={false}
            nodesDraggable={false}
            defaultEdgeOptions={{
              animated: false,
              style: {
                stroke: '#00ff00',
                strokeWidth: 4,
              }
            }}
          >
          <Background color="#374151" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(n) => {
              const section = getSection(n.id);
              return section?.color || "#6B7280";
            }}
            style={{
              backgroundColor: "#2a2a2a",
            }}
          />
        </ReactFlow>
        </div>
      </div>

      {/* Modal */}
      {selectedSection && (
        <StyledModal
          isOpen={true}
          onClose={() => setSelectedSection(null)}
          section={selectedSection}
          onChecklistChange={handleChecklistChange}
          checklist={progress}
        />
      )}
    </div>
  );
}
