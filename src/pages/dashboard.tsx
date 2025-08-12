import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
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
import { translateRoadmapSections } from '@/utils/translateRoadmap';
import type { RoadmapSection } from '@/utils/translateRoadmap';
import StyledModal from "@/components/Modal";
import LoadingSpinner from "@/components/LoadingSpinner";
import LanguageSwitcher from '@/components/LanguageSwitcher';

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
        relative min-w-[180px] max-w-[220px] sm:min-w-[240px] sm:max-w-[280px] 
        p-3 sm:p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer 
        shadow-lg hover:shadow-xl
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
        className="!w-3 !h-3 sm:!w-4 sm:!h-4 !border-2 sm:!border-4 !border-white !bg-green-400 !top-[-6px] sm:!top-[-8px]"
      />
      
      <div className="text-center">
        <h3 className="font-bold text-xs sm:text-base mb-2 sm:mb-3 leading-tight">{section.title}</h3>
        
        {/* Progress Bar */}
        <div className="w-full bg-black/25 rounded-full h-2 sm:h-3 mb-2 sm:mb-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-400 to-green-300 h-2 sm:h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </div>
        </div>
        
        <div className="text-xs sm:text-sm font-medium opacity-95">
          {percentage.toFixed(0)}% Complete
        </div>
        
        {/* Steps count indicator - only count required steps for progress */}
        <div className="text-xs sm:text-xs opacity-75 mt-1 sm:mt-2">
          {(() => {
            const requiredSteps = section.steps.filter(step => !step.optional);
            const completedRequired = section.steps
              .map((step, idx) => ({ step, idx }))
              .filter(({ step }) => !step.optional)
              .filter(({ idx }) => data.section.steps[idx])
              .length;
            return `${completedRequired} of ${requiredSteps.length} required`;
          })()}
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-3 !h-3 sm:!w-4 sm:!h-4 !border-2 sm:!border-4 !border-white !bg-green-400 !bottom-[-6px] sm:!bottom-[-8px]"
      />
    </div>
  );
};

// Register node types
const nodeTypes: NodeTypes = {
  default: RoadmapNode,
};

export default function Dashboard() {
  const { t: tCommon } = useTranslation('common');
  const { t: tRoadmap } = useTranslation('roadmap');
  const { user, loading: authLoading, isGuestMode, signOut } = useAuth();
  const router = useRouter();
  
  const roadmapSections = useMemo(() => translateRoadmapSections(tRoadmap), [tRoadmap]);
  
  const { nodes, edges, progress, loading, loadRoadmap, handleToggle, getSection, hasLoaded } = useRoadmap(user, isGuestMode, roadmapSections);
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
      <div className="bg-gray-800 border-b border-gray-700 px-3 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5">
        <div className="flex flex-col sm:flex-row md:justify-between md:items-center space-y-3 sm:space-y-0">
          <div className="flex flex-col sm:flex-row md:items-center space-y-2 sm:space-y-0 sm:space-x-3 md:space-x-6">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight">
              {tCommon('navigation.studyAbroadRoadmap')}
            </h1>
            {user ? (
              <span className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-green-900/50 text-green-300 border border-green-700/50 max-w-fit shadow-sm">
                <span className="hidden sm:inline md:text-sm">{tCommon('common.signedInAs')} </span>
                <span className="truncate text-xs sm:text-sm">{user.email}</span>
              </span>
            ) : (
              <span className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-gray-700/50 text-gray-300 border border-gray-600/50 shadow-sm">
                <span className="hidden sm:inline">{tCommon('common.guestModeDescription')}</span>
                <span className="sm:hidden">{tCommon('common.guestMode')}</span>
              </span>
            )}
          </div>
          <div className="flex items-center justify-end space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-5">
            <LanguageSwitcher />
            {user ? (
              <button
                onClick={handleSignOut}
                className="text-xs sm:text-sm md:text-base text-gray-400 hover:text-gray-200 transition-colors duration-200 px-2 sm:px-3 md:px-4 lg:px-5 py-1 md:py-1.5 lg:py-2 rounded-md hover:bg-gray-700/50 font-semibold"
              >
                {tCommon('common.signOut')}
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="text-xs sm:text-sm md:text-base bg-blue-600 text-white px-2 sm:px-3 md:px-4 lg:px-5 py-1 md:py-1.5 lg:py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md font-semibold"
              >
                <span className="hidden sm:inline lg:text-base">{tCommon('common.signIn')}</span>
                <span className="sm:hidden">{tCommon('common.signIn')}</span>
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
            minZoom: 0.15,
            maxZoom: 0.6,
          }}
          className="bg-gray-900"
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          zoomOnDoubleClick={false}
          panOnDrag={true}
          minZoom={0.1}
          maxZoom={1.2}
          defaultViewport={{ x: 0, y: 0, zoom: window.innerWidth < 768 ? 0.25 : 0.5 }}
        >
          <Background 
            color="#374151" 
            gap={window.innerWidth < 768 ? 16 : 32} 
            size={window.innerWidth < 768 ? 2 : 3}
          />
          <Controls 
            className="bg-gray-800 border border-gray-600 scale-75 sm:scale-100"
            showInteractive={false}
          />
          <MiniMap
            nodeColor={(node) => {
              const section = getSection(node.id);
              return section?.color || "#6B7280";
            }}
            className="bg-gray-800 border border-gray-600 scale-75 sm:scale-100 hidden sm:block"
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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'roadmap'])),
    },
  };
};
