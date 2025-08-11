import { useState, useCallback, useEffect } from "react";
import { useRouter } from 'next/router';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  NodeTypes,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

import { useAuth } from '@/contexts/AuthContext';
import { useRoadmap } from '@/hooks/useRoadmap';
import { RoadmapSection } from '@/constants/roadmap';
import StyledModal from "@/components/Modal";
import LoadingSpinner from "@/components/LoadingSpinner";

// Custom Node Component
interface RoadmapNodeProps {
  data: {
    section: RoadmapSection;
    percentage: number;
  };
  selected?: boolean;
}

const RoadmapNode = ({ data, selected }: RoadmapNodeProps) => {
  const { section, percentage } = data;
  
  return (
    <div
      className={`
        relative min-w-[200px] p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
        ${selected ? 'border-blue-400 shadow-lg' : 'border-gray-300 hover:border-gray-400'}
      `}
      style={{
        backgroundColor: section.color,
        color: 'white',
      }}
    >
      <Handle type="target" position={Position.Top} />
      
      <div className="text-center">
        <h3 className="font-semibold text-sm mb-2">{section.title}</h3>
        
        {/* Progress Bar */}
        <div className="w-full bg-black/20 rounded-full h-2 mb-2">
          <div
            className="bg-green-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="text-xs opacity-90">
          {percentage.toFixed(0)}% Complete
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

// Register node types
const nodeTypes: NodeTypes = {
  default: RoadmapNode,
};

export default function Dashboard() {
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

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    router.reload();
  };

  // Handle node click
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const section = getSection(node.id);
      if (section) {
        setSelectedSection(section);
      }
    },
    [getSection]
  );

  // Handle checklist change from modal
  const handleChecklistChange = useCallback(
    (sectionId: string, stepIndex: number) => {
      handleToggle(sectionId, stepIndex);
    },
    [handleToggle]
  );

  if (authLoading || loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">Student Onboarding Roadmap</h1>
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
      </div>

      {/* Roadmap Content */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: 0.1,
            includeHiddenNodes: false,
            minZoom: 0.5,
            maxZoom: 1.2,
          }}
          className="bg-gray-900"
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          zoomOnDoubleClick={false}
          panOnDrag={true}
          minZoom={0.3}
          maxZoom={2}
        >
          <Background 
            color="#374151" 
            gap={16} 
            size={1}
          />
          <Controls 
            className="bg-gray-800 border border-gray-600"
            showInteractive={false}
          />
          <MiniMap
            nodeColor={(node) => {
              const section = getSection(node.id);
              return section?.color || "#6B7280";
            }}
            className="bg-gray-800 border border-gray-600"
            style={{
              backgroundColor: "#1F2937",
            }}
          />
        </ReactFlow>
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
