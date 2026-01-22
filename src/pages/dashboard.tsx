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
import MainLayout from '@/components/layout/MainLayout';
import AIChatbot from '@/components/AIChatbot';
import SEO from '@/components/SEO';

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
        relative w-[200px] h-[140px] sm:w-[280px] sm:h-[180px] lg:w-[320px] lg:h-[200px]
        p-3 sm:p-5 lg:p-7 rounded-xl border-2 transition-all duration-300 cursor-pointer 
        shadow-lg hover:shadow-2xl transform hover:scale-105 flex flex-col justify-between
        ${selected ? 'border-blue-400 shadow-blue-400/30 ring-2 ring-blue-400/50' : 'border-white/20 hover:border-white/40'}
        ${isCompleted ? 'animate-pulse border-gold-400 shadow-gold-400/30' : ''}
      `}
      style={{
        backgroundColor: isCompleted ? '#1e7e34' : section.color,
        color: 'white',
        boxShadow: isCompleted 
          ? '0 0 40px rgba(255, 215, 0, 0.4), 0 8px 32px rgba(30, 126, 52, 0.5)'
          : selected 
            ? `0 0 30px ${section.color}60` 
            : `0 8px 25px ${section.color}40`,
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
        className="!w-2.5 !h-2.5 sm:!w-3.5 sm:!h-3.5 lg:!w-4 lg:!h-4 !border-2 lg:!border-4 !border-white !bg-green-400 !top-[-5px] sm:!top-[-6px] lg:!top-[-8px]"
      />
      
      <div className="text-center relative z-10">
        {/* Completion Badge */}
        {isCompleted && (
          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
            <svg className="w-3 h-3 sm:w-5 sm:h-5 text-green-800" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        <h3 className="font-bold text-xs sm:text-base lg:text-lg mb-2 sm:mb-3 lg:mb-4 leading-tight line-clamp-2">
          {isCompleted ? `✅ ${section.title}` : section.title}
        </h3>
        
        {/* Progress Bar */}
        <div className="w-full bg-black/25 rounded-full h-2 sm:h-3 lg:h-4 mb-2 sm:mb-3 lg:mb-4 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden ${
              isCompleted 
                ? 'bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400' 
                : 'bg-gradient-to-r from-green-400 to-green-300'
            }`}
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </div>
        </div>
        
        <div className={`text-xs sm:text-sm lg:text-base font-bold mb-1 sm:mb-2 ${
          isCompleted ? 'text-yellow-200' : 'opacity-95'
        }`}>
          {isCompleted ? '🎉 COMPLETED!' : `${percentage.toFixed(0)}%`}
        </div>
        
        {/* Steps count indicator */}
        <div className="text-[10px] sm:text-xs lg:text-sm opacity-75">
          {(() => {
            const requiredSteps = section.steps.filter(step => !step.optional);
            const completedRequired = Math.round((percentage / 100) * requiredSteps.length);
            return isCompleted 
              ? '🏆 All done!' 
              : `${completedRequired}/${requiredSteps.length} required`;
          })()}
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-2.5 !h-2.5 sm:!w-3.5 sm:!h-3.5 lg:!w-4 lg:!h-4 !border-2 lg:!border-4 !border-white !bg-green-400 !bottom-[-5px] sm:!bottom-[-6px] lg:!bottom-[-8px]"
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
      <MainLayout showHeader={false} showFooter={false}>
        <div className="flex h-screen w-full items-center justify-center">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-400">Loading your roadmap...</p>
          </div>
        </div>
      </MainLayout>
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
      
      <MainLayout title={tCommon('navigation.studyAbroadRoadmap')}>
        {/* Main Roadmap Content */}
        <div className="relative h-[calc(100vh-16rem)] sm:h-[calc(100vh-14rem)]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{
              padding: 0.15,
              includeHiddenNodes: false,
              minZoom: 0.1,
              maxZoom: 0.8,
            }}
            className="bg-gray-900"
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
            zoomOnDoubleClick={false}
            panOnDrag={true}
            minZoom={0.05}
            maxZoom={1.5}
            defaultViewport={{ 
              x: 0, 
              y: 0, 
              zoom: typeof window !== 'undefined' && window.innerWidth < 640 ? 0.2 : 
                    typeof window !== 'undefined' && window.innerWidth < 1024 ? 0.35 : 0.5 
            }}
          >
            <Background 
              color="#374151" 
              gap={typeof window !== 'undefined' && window.innerWidth < 640 ? 12 : 24} 
              size={typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 2}
            />
            <MiniMap
              nodeColor={(node) => {
                const section = getSection(node.id);
                return section?.color || "#6B7280";
              }}
              className="hidden sm:block bg-gray-800 border border-gray-600 rounded-lg"
              style={{
                backgroundColor: "#1F2937",
              }}
              position="bottom-left"
            />
            <Controls 
              className="bg-gray-800 border border-gray-600 rounded-lg shadow-lg"
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
      </MainLayout>
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
