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
        relative min-w-[240px] max-w-[280px] p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl
        ${selected ? 'border-blue-400 shadow-blue-400/20' : 'border-white/20 hover:border-white/40'}
      `}
      style={{
        backgroundColor: section.color,
        color: 'white',
        boxShadow: selected ? `0 0 30px ${section.color}40` : `0 8px 25px ${section.color}30`,
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-4 !h-4 !border-4 !border-white !bg-green-400 !top-[-8px]"
      />
      
      <div className="text-center">
        <h3 className="font-bold text-base mb-3 leading-tight">{section.title}</h3>
        
        {/* Progress Bar */}
        <div className="w-full bg-black/25 rounded-full h-3 mb-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-400 to-green-300 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </div>
        </div>
        
        <div className="text-sm font-medium opacity-95">
          {percentage.toFixed(0)}% Complete
        </div>
        
        {/* Steps count indicator */}
        <div className="text-xs opacity-75 mt-2">
          {section.steps.filter((_, idx) => data.section.steps[idx]).length || 0} of {section.steps.length} steps
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-4 !h-4 !border-4 !border-white !bg-green-400 !bottom-[-8px]"
      />
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
            padding: 0.2,
            includeHiddenNodes: false,
            minZoom: 0.3,
            maxZoom: 0.8,
          }}
          className="bg-gray-900"
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          zoomOnDoubleClick={false}
          panOnDrag={true}
          minZoom={0.15}
          maxZoom={1.2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        >
          <Background 
            color="#374151" 
            gap={32} 
            size={3}
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
