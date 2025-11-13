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
import Header from '@/components/Header';
import SEO from '@/components/SEO';
import Footer from '@/components/Footer';

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

// Custom Node Component for Roadmap Sections
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
        relative w-[280px] h-[200px]
        p-6 rounded-xl border-2 transition-all duration-500 cursor-pointer 
        shadow-lg hover:shadow-2xl transform hover:scale-105 flex flex-col justify-between
        ${selected ? 'border-blue-400 shadow-blue-400/20' : 'border-white/20 hover:border-white/40'}
        ${isCompleted ? 'animate-pulse border-yellow-400 shadow-yellow-400/30' : ''}
      `}
      style={{
        backgroundColor: section.color,
        color: 'white',
        boxShadow: isCompleted 
          ? '0 0 40px rgba(255, 215, 0, 0.4), 0 8px 32px rgba(30, 126, 52, 0.5)'
          : `0 8px 25px ${section.color}30`,
      }}
    >
      {isCompleted && (
        <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce shadow-lg">
          <svg className="w-6 h-6 text-green-800" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-4 !h-4 !border-4 !border-white !bg-green-400 !top-[-8px]"
      />
      
      <div className="text-center relative z-10">
        <h3 className="font-bold text-lg mb-2 leading-tight">
          {isCompleted ? `✅ ${section.title}` : section.title}
        </h3>
        <p className="text-xs text-white/80 mb-3 line-clamp-2">{section.description}</p>
        
        {/* Progress Bar */}
        <div className="w-full bg-black/25 rounded-full h-4 mb-3 overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-700 ease-out relative overflow-hidden ${
              isCompleted 
                ? 'bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400' 
                : 'bg-gradient-to-r from-green-400 to-green-300'
            }`}
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </div>
        </div>
        
        <span className="text-xl font-bold">{Math.round(percentage)}%</span>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-4 !h-4 !border-4 !border-white !bg-blue-400 !bottom-[-8px]"
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

  const nodeTypes: NodeTypes = useMemo(() => ({ roadmapNode: RoadmapNode }), []);

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
      <div className="min-h-screen bg-gray-900 text-white">
        <Header title={t('customRoadmap.loading')} />
        <div className="container mx-auto px-4 py-12 text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-400">{t('customRoadmap.loadingYourRoadmap')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !roadmap) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <SEO title={t('customRoadmap.notFound')} />
        <Header title={t('customRoadmap.notFound')} />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">{t('customRoadmap.notFound')}</h1>
          <p className="text-gray-400 mb-6">{error || t('customRoadmap.notFoundMessage')}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            {t('customRoadmap.backToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  // Access control
  if (user && user.uid !== roadmap.userId) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <SEO title={t('customRoadmap.accessDenied')} />
        <Header title={t('customRoadmap.accessDenied')} />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">{t('customRoadmap.accessDenied')}</h1>
          <p className="text-gray-400 mb-6">{t('customRoadmap.accessDeniedMessage')}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            {t('customRoadmap.backToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  const createdDate = new Date(roadmap.createdAt.seconds * 1000).toLocaleDateString();
  const overallProgress = roadmap.roadmapData.roadmapSections 
    ? Math.round(roadmap.roadmapData.roadmapSections.reduce((sum, section) => sum + calculateSectionProgress(section), 0) / roadmap.roadmapData.roadmapSections.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <SEO title={roadmap.roadmapData.title || 'Custom Roadmap'} />
      <Header title={t('customRoadmap.yourCustomRoadmap')} />

      <div className="container mx-auto px-4 py-6">
        {/* Header Info Card */}
        <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 rounded-xl p-6 mb-6 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h2 className="font-bold mb-2">{roadmap.roadmapData.title}</h2>
              <p className="text-gray-300">{t('customRoadmap.createdOn')} {createdDate}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
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

        {/* Mobile Warning Message */}
        <div className="block md:hidden bg-yellow-900/30 border-2 border-yellow-500/50 rounded-xl p-6 mb-6 text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-yellow-300 mb-3">
            {t('customRoadmap.mobileNotSupported')}
          </h3>
          <p className="text-gray-300 mb-4">
            {t('customRoadmap.mobileNotSupportedMessage')}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/my-roadmaps')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              {t('navigation.myRoadmaps')}
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              {t('customRoadmap.backToDashboard')}
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-yellow-500/30">
            <p className="text-sm text-gray-400 italic">
              💻 {t('customRoadmap.viewOnDesktop')}
            </p>
          </div>
        </div>

        {/* Mind Map Visualization - Hidden on Mobile */}
        <div className="hidden md:block bg-gray-800 rounded-xl shadow-2xl mb-6" style={{ height: '600px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.5}
            maxZoom={1.5}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            className="rounded-xl"
          >
            <Background color="#4B5563" gap={16} />
            <Controls className="!bg-gray-700 !border-gray-600" />
            <MiniMap
              nodeColor={(node) => {
                const section = node.data.section;
                return section?.color || '#8b5cf6';
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
          </ReactFlow>
        </div>

        {/* Instructions - Hidden on Mobile */}
        <div className="hidden md:block bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-300">
            💡 <strong>Tip:</strong> {t('customRoadmap.clickTip')} {roadmap.university}!
          </p>
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

      <Footer />
    </div>
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
