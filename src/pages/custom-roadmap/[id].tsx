import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { GetStaticProps, GetStaticPaths } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import MainLayout from '@/components/layout/MainLayout';
import AIChatbot from '@/components/AIChatbot';
import SEO from '@/components/SEO';

interface RoadmapStep {
  title: string;
  description?: string;
  referenceLink?: string;
  optional?: boolean;
  completed?: boolean;
}

interface RoadmapSection {
  id: string;
  title: string;
  description: string;
  steps: RoadmapStep[];
  position: { x: number; y: number };
  color: string;
}

interface CustomRoadmapData {
  id: string;
  userId: string;
  university: string;
  universityWebsite?: string;
  degreeLevel: string;
  major: string;
  faculty?: string;
  isCustom: boolean;
  roadmapData: {
    title: string;
    overview: string;
    roadmapSections: RoadmapSection[];
  };
  createdAt: { seconds: number; nanoseconds: number };
  updatedAt: { seconds: number; nanoseconds: number };
}

// Custom Node Component
interface RoadmapNodeProps {
  data: {
    section: RoadmapSection;
    percentage: number;
    onOpenModal: () => void;
  };
  selected?: boolean;
}

const RoadmapNode = ({ data, selected }: RoadmapNodeProps) => {
  const { section, percentage } = data;
  const isCompleted = percentage === 100;
  
  return (
    <div
      onClick={data.onOpenModal}
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

export default function CustomRoadmapPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState<CustomRoadmapData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<RoadmapSection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch roadmap data
  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        const roadmapDoc = await getDoc(doc(db, 'customRoadmaps', id));

        if (!roadmapDoc.exists()) {
          setError('Roadmap not found');
          return;
        }

        const data = roadmapDoc.data();
        setRoadmap({
          id: roadmapDoc.id,
          ...data,
        } as CustomRoadmapData);
      } catch (err) {
        console.error('Error fetching roadmap:', err);
        setError('Failed to load roadmap');
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [id]);

  // Calculate completion percentage for each section
  const calculateSectionProgress = useCallback((section: RoadmapSection) => {
    if (!section || !section.steps || section.steps.length === 0) return 0;
    
    const completedSteps = section.steps.filter(step => step.completed).length;
    return (completedSteps / section.steps.length) * 100;
  }, []);

  // Generate edges matching dashboard pattern
  const generateEdges = useMemo((): Edge[] => {
    const edgeConfigs = [
      { from: 'choose-school', to: 'applying' },
      { from: 'applying', to: 'immigration' },
      { from: 'applying', to: 'transportation' },
      { from: 'applying', to: 'housing' },
      { from: 'applying', to: 'necessary-items' },
      { from: 'immigration', to: 'student-card' },
      { from: 'transportation', to: 'student-card' },
      { from: 'housing', to: 'student-card' },
      { from: 'necessary-items', to: 'student-card' },
      { from: 'student-card', to: 'bank-account' },
      { from: 'bank-account', to: 'orientation' },
    ];

    return edgeConfigs.map(({ from, to }) => ({
      id: `e-${from}-${to}`,
      source: from,
      target: to,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#ffffff', strokeWidth: 2 },
      markerEnd: 'arrowclosed',
    }));
  }, []);

  // Create nodes and edges for ReactFlow
  const { nodes, edges } = useMemo(() => {
    if (!roadmap?.roadmapData.roadmapSections) return { nodes: [], edges: [] };

    const sectionNodes: Node[] = roadmap.roadmapData.roadmapSections.map((section) => ({
      id: section.id,
      type: 'roadmapNode',
      position: section.position,
      data: {
        section,
        percentage: calculateSectionProgress(section),
        onOpenModal: () => {
          setSelectedSection(section);
          setIsModalOpen(true);
        },
      },
    }));

    return { nodes: sectionNodes, edges: generateEdges };
  }, [roadmap, calculateSectionProgress, generateEdges]);

  // Register node types
  const nodeTypes: NodeTypes = useMemo(() => ({
    roadmapNode: RoadmapNode,
  }), []);

  // Handle step toggle
  const handleToggleStep = async (stepIndex: number) => {
    if (!roadmap || !selectedSection) return;

    const updatedRoadmap = { ...roadmap };
    const sectionIndex = updatedRoadmap.roadmapData.roadmapSections?.findIndex(s => s.id === selectedSection.id);
    
    if (sectionIndex === undefined || sectionIndex === -1 || !updatedRoadmap.roadmapData.roadmapSections?.[sectionIndex].steps) return;

    updatedRoadmap.roadmapData.roadmapSections[sectionIndex].steps[stepIndex].completed = 
      !updatedRoadmap.roadmapData.roadmapSections[sectionIndex].steps[stepIndex].completed;

    try {
      await updateDoc(doc(db, 'customRoadmaps', roadmap.id), {
        roadmapData: updatedRoadmap.roadmapData,
        updatedAt: new Date(),
      });

      setRoadmap(updatedRoadmap);
      setSelectedSection(updatedRoadmap.roadmapData.roadmapSections[sectionIndex]);
    } catch (err) {
      console.error('Error updating step:', err);
      alert(t('myRoadmaps.deleteError'));
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!roadmap) return;
    if (!confirm(t('customRoadmap.deleteConfirmation'))) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'customRoadmaps', roadmap.id));
      router.push('/dashboard');
    } catch (err) {
      console.error('Error deleting roadmap:', err);
      alert(t('myRoadmaps.deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <MainLayout showHeader={false} showFooter={false}>
        <div className="flex h-screen w-full items-center justify-center">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-400">{t('customRoadmap.loadingYourRoadmap')}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error || !roadmap) {
    return (
      <MainLayout title={t('customRoadmap.notFound')}>
        <SEO title={t('customRoadmap.notFound')} />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="mb-4 text-3xl font-bold">{t('customRoadmap.notFound')}</h1>
          <p className="mb-6 text-gray-400">{error || t('customRoadmap.notFoundMessage')}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          >
            {t('customRoadmap.backToDashboard')}
          </button>
        </div>
      </MainLayout>
    );
  }

  // Access control
  if (user && user.uid !== roadmap.userId) {
    return (
      <MainLayout title={t('customRoadmap.accessDenied')}>
        <SEO title={t('customRoadmap.accessDenied')} />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="mb-4 text-3xl font-bold">{t('customRoadmap.accessDenied')}</h1>
          <p className="mb-6 text-gray-400">{t('customRoadmap.accessDeniedMessage')}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          >
            {t('customRoadmap.backToDashboard')}
          </button>
        </div>
      </MainLayout>
    );
  }

  const createdDate = new Date(roadmap.createdAt.seconds * 1000).toLocaleDateString();
  const overallProgress = roadmap.roadmapData.roadmapSections 
    ? Math.round(roadmap.roadmapData.roadmapSections.reduce((sum, section) => sum + calculateSectionProgress(section), 0) / roadmap.roadmapData.roadmapSections.length)
    : 0;

  return (
    <MainLayout title={t('customRoadmap.yourCustomRoadmap')}>
      <SEO title={roadmap.roadmapData.title || 'Custom Roadmap'} />

      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6">
        {/* Header Info Card */}
        <div className="mb-4 rounded-xl bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 p-4 shadow-2xl sm:mb-6 sm:p-6">
          <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex-1">
              <h2 className="mb-1 text-lg font-bold sm:mb-2 sm:text-xl lg:text-2xl">{roadmap.roadmapData.title}</h2>
              <p className="text-sm text-gray-300">{t('customRoadmap.createdOn')} {createdDate}</p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm text-white transition-colors hover:bg-red-700 disabled:opacity-50 sm:px-4"
              >
                {isDeleting ? (
                  <>
                    <LoadingSpinner />
                    <span>{t('customRoadmap.deleting')}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {t('customRoadmap.delete')}
                  </>
                )}
              </button>
            </div>
          </div>


          {/* Overall Progress */}
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{t('customRoadmap.overallProgress')}</span>
              <span className="text-2xl font-bold">{overallProgress}%</span>
            </div>
            <div className="w-full bg-black/25 rounded-full h-4 overflow-hidden">
              <div
                className="h-4 rounded-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-700"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Mind Map Visualization */}
        <div className="relative h-[calc(100vh-16rem)] sm:h-[calc(100vh-14rem)]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
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
                const section = node.data.section;
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
      </div>

      {/* Section Detail Modal */}
      {isModalOpen && selectedSection && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-2 sm:p-4 overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div 
            className="bg-[#1e1e1e] w-full max-w-5xl rounded-xl shadow-lg overflow-hidden flex flex-col"
            style={{
              maxHeight: '85vh',
            }}
          >
            {/* Header */}
            <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
              <button
                onClick={() => setIsModalOpen(false)}
                className="self-end sm:self-auto mb-2 sm:mb-0 bg-red-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold text-sm"
              >
                {t('common.close')}
              </button>
              <div className="text-center flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-1">{selectedSection.title}</h2>
                <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto leading-relaxed">{selectedSection.description}</p>
              </div>
              <div className="w-0 sm:w-20"></div>
            </div>

            {/* Progress Section */}
            <div className="flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 md:py-4 bg-gray-800/50">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 mb-3">
                <div className="text-center">
                  <div className="text-xs sm:text-sm text-gray-400">{t('common.requiredSteps')}</div>
                  <div className="text-base sm:text-lg font-bold text-green-400">
                    {selectedSection.steps.filter(s => !s.optional && s.completed).length} / {selectedSection.steps.filter(s => !s.optional).length}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs sm:text-sm text-gray-400">{t('common.totalProgress')}</div>
                  <div className="text-base sm:text-lg font-bold text-blue-400">
                    {selectedSection.steps.filter(s => s.completed).length} / {selectedSection.steps.length}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs sm:text-sm text-gray-400">{t('common.completion')}</div>
                  <div className="text-base sm:text-lg font-bold text-white">
                    {Math.round((selectedSection.steps.filter(s => !s.optional && s.completed).length / selectedSection.steps.filter(s => !s.optional).length) * 100)}%
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2 sm:h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-400 h-2 sm:h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${(selectedSection.steps.filter(s => !s.optional && s.completed).length / selectedSection.steps.filter(s => !s.optional).length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Steps Content */}
            <div className="flex-1 overflow-auto">
              <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                {selectedSection.steps.map((step, idx) => {
                  const isChecked = step.completed || false;
                  const isOptional = step.optional || false;
                  
                  return (
                    <div
                      key={idx}
                      className={`
                        border rounded-lg p-3 sm:p-4 transition-all duration-200
                        ${isOptional 
                          ? 'border-gray-600 bg-gray-800/30' 
                          : 'border-blue-500/30 bg-blue-900/10'
                        }
                        ${isChecked ? 'bg-green-900/20 border-green-500/50' : ''}
                        hover:shadow-lg hover:scale-[1.01]
                      `}
                    >
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleStep(idx)}
                            className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mb-2">
                            <h3 className={`
                              font-semibold text-xs sm:text-sm flex-1
                              ${isOptional ? 'text-gray-300' : 'text-white'}
                              ${isChecked ? 'line-through opacity-75' : ''}
                            `}>
                              {step.title}
                            </h3>
                            
                            <div className="flex space-x-2">
                              {isOptional ? (
                                <span className="px-2 py-0.5 sm:py-1 text-xs font-medium bg-yellow-900/50 text-yellow-300 rounded-full">
                                  {t('common.optional')}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 sm:py-1 text-xs font-medium bg-blue-900/50 text-blue-300 rounded-full">
                                  {t('common.required')}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {step.description && (
                            <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 leading-relaxed">
                              {step.description}
                            </p>
                          )}
                          
                          {step.referenceLink && (
                            <div className="mt-2 sm:mt-3">
                              <a
                                href={step.referenceLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-blue-400 hover:text-blue-300 underline transition-colors"
                              >
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                <span className="break-words">{t('common.reference')}</span>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 md:py-4 bg-gray-800/50 border-t border-gray-700">
              <div className="text-center text-xs sm:text-sm text-gray-400">
                {t('customRoadmap.completeAllSteps')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Chatbot */}
      <AIChatbot />
    </MainLayout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};
