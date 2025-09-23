import { useState, useCallback, useEffect, useMemo } from "react";
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
import Header from '@/components/Header';
import AIChatbot from '@/components/AIChatbot';
import SEO from '@/components/SEO';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';

// Custom Node Component
interface RoadmapNodeProps {
  data: {
    section: RoadmapSection;
    percentage: number;
    progress?: Record<string, boolean>; // Add progress to data
  };
  selected?: boolean;
}

const RoadmapNode = ({ data, selected }: RoadmapNodeProps) => {
  const { section, percentage } = data;
  const isCompleted = percentage === 100;
  
  return (
    <div
      className={`
        relative w-[250px] h-[180px] sm:w-[320px] sm:h-[200px] 
        p-4 sm:p-7 rounded-xl border-2 transition-all duration-500 cursor-pointer 
        shadow-lg hover:shadow-xl transform hover:scale-105 flex flex-col justify-between
        ${selected ? 'border-blue-400 shadow-blue-400/20' : 'border-white/20 hover:border-white/40'}
        ${isCompleted ? 'animate-pulse border-gold-400 shadow-gold-400/30' : ''}
      `}
      style={{
        backgroundColor: isCompleted ? '#1e7e34' : section.color, // Dark green for completed
        color: 'white',
        boxShadow: isCompleted 
          ? '0 0 40px rgba(255, 215, 0, 0.4), 0 8px 32px rgba(30, 126, 52, 0.5)' // Gold glow + green shadow
          : selected 
            ? `0 0 30px ${section.color}40` 
            : `0 8px 25px ${section.color}30`,
      }}
    >
      {/* Completion Animation Overlay */}
      {isCompleted && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/20 to-transparent animate-shimmer"></div>
        </div>
      )}

      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-3 !h-3 sm:!w-4 sm:!h-4 !border-2 sm:!border-4 !border-white !bg-green-400 !top-[-6px] sm:!top-[-8px]"
      />
      
      <div className="text-center relative z-10">
        {/* Completion Badge */}
        {isCompleted && (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
            <svg className="w-5 h-5 text-green-800" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        <h3 className="font-bold text-sm sm:text-lg mb-3 sm:mb-4 leading-tight">
          {isCompleted ? `✅ ${section.title}` : section.title}
        </h3>
        
        {/* Progress Bar */}
        <div className="w-full bg-black/25 rounded-full h-3 sm:h-4 mb-3 sm:mb-4 overflow-hidden">
          <div
            className={`h-3 sm:h-4 rounded-full transition-all duration-700 ease-out relative overflow-hidden ${
              isCompleted 
                ? 'bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 animate-pulse' 
                : 'bg-gradient-to-r from-green-400 to-green-300'
            }`}
            style={{ width: `${percentage}%` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent ${
              isCompleted ? 'animate-shimmer' : 'animate-pulse'
            }`} />
          </div>
        </div>
        
        <div className={`text-sm sm:text-base font-bold mb-2 ${
          isCompleted ? 'text-yellow-200 animate-pulse' : 'opacity-95'
        }`}>
          {isCompleted ? '🎉 COMPLETED!' : `${percentage.toFixed(0)}% Complete`}
        </div>
        
        {/* Steps count indicator */}
        <div className="text-xs sm:text-sm opacity-75">
          {(() => {
            const requiredSteps = section.steps.filter(step => !step.optional);
            // Calculate completed required steps based on percentage
            const completedRequired = Math.round((percentage / 100) * requiredSteps.length);
            return isCompleted 
              ? '🏆 All requirements met!' 
              : `${completedRequired} of ${requiredSteps.length} required`;
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
  const { user, loading: authLoading, isGuestMode } = useAuth();
  
  const roadmapSections = useMemo(() => translateRoadmapSections(tRoadmap), [tRoadmap]);
  
  const { nodes, edges, progress, loading, loadRoadmap, handleToggle, getSection, hasLoaded } = useRoadmap(user, isGuestMode, roadmapSections);
  const [selectedSection, setSelectedSection] = useState<RoadmapSection | null>(null);

  // Load data when component mounts or auth state changes
  useEffect(() => {
    if (!authLoading && !hasLoaded) {
      loadRoadmap();
    }
  }, [authLoading, hasLoaded, loadRoadmap]);

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
    <>
      <SEO
        title="Study Abroad Dashboard - Interactive Roadmap"
        description="Track your study abroad progress with our interactive roadmap. Complete university applications, visa requirements, and preparation steps for international education."
        keywords="study abroad dashboard, roadmap tracker, international student guide, university applications, visa requirements, study abroad checklist"
        url="https://studyoverseasmap.com/dashboard"
      />
      <div className="h-screen w-full flex flex-col bg-gray-900">
        {/* Header */}
        <Header title={tCommon('navigation.studyAbroadRoadmap')} />

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
          <MiniMap
            nodeColor={(node) => {
              const section = getSection(node.id);
              return section?.color || "#6B7280";
            }}
            className="bg-gray-800 border border-gray-600 scale-75 sm:scale-100 hidden sm:block"
            style={{
              backgroundColor: "#1F2937",
              left: 50,
              bottom: 1,
              top: 'auto',
              right: 'auto'
            }}
            position="bottom-left"
          />
          <Controls 
            className="bg-gray-800 border border-gray-600 scale-75 sm:scale-100"
            showInteractive={false}
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

      {/* AI Chatbot */}
      <AIChatbot />

      {/* Footer */}
      <Footer />

      {/* Cookie Consent */}
      <CookieConsent />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'roadmap'])),
    },
  };
};
