import { useState, useCallback, useRef, useEffect } from 'react';
import { Node, Edge, Position, MarkerType } from 'reactflow';
import { createClient } from '@/lib/supabase';
import type { RoadmapSection } from '@/utils/translateRoadmap';
import { createDebouncedFunction } from '@/utils/debounce';

// Types
interface NodeData {
  section: RoadmapSection;
  percentage: number;
}

// Default progress state
const DEFAULT_PROGRESS: Record<string, boolean> = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useRoadmap(user: any, isGuestMode: boolean, roadmapSections: RoadmapSection[]) {
  const [progress, setProgress] = useState<Record<string, boolean>>(DEFAULT_PROGRESS);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const hasLoadedRef = useRef(false);
  const supabase = createClient();

  // Generate nodes
  const generateNodes = useCallback(() => {
    const nodeArray: Node<NodeData>[] = roadmapSections.map((section) => {
      // Only count non-optional steps for progress calculation
      const requiredSteps = section.steps.filter((step) => !step.optional);
      const totalRequiredSteps = requiredSteps.length;
      
      const completedRequiredSteps = section.steps
        .map((step, idx) => ({ step, idx }))
        .filter(({ step }) => !step.optional)
        .filter(({ idx }) => progress[`${section.id}-${idx}`])
        .length;
      
      const percentage = totalRequiredSteps > 0 ? (completedRequiredSteps / totalRequiredSteps) * 100 : 0;

      return {
        id: section.id,
        type: 'default',
        position: section.position,
        data: {
          section,
          percentage,
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        draggable: false,
        selectable: true,
      };
    });

    setNodes(nodeArray);
  }, [progress, roadmapSections]);

  // Generate edges
  const generateEdges = useCallback(() => {
    const edgeConnections = [
      { source: "choose-school", target: "applying" },
      { source: "applying", target: "immigration" },
      { source: "applying", target: "transportation" },
      { source: "applying", target: "housing" },
      { source: "applying", target: "necessary-items" },
      { source: "immigration", target: "student-card" },
      { source: "transportation", target: "student-card" },
      { source: "housing", target: "student-card" },
      { source: "necessary-items", target: "student-card" },
      { source: "student-card", target: "bank-account" },
      { source: "bank-account", target: "orientation" }
    ];

    const edgeArray: Edge[] = edgeConnections.map(({ source, target }) => ({
      id: `edge-${source}-to-${target}`,
      source,
      target,
      type: 'smoothstep',
      animated: false,
      style: {
        stroke: '#ffffff',
        strokeWidth: 6,
        strokeDasharray: '0',
        opacity: 0.8,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#ffffff',
        width: 12,
        height: 12,
        strokeWidth: 1,
      },
      zIndex: 1,
      pathOptions: {
        offset: 20,
        borderRadius: 10,
      },
    }));

    setEdges(edgeArray);
  }, []);

  // Update nodes and edges when progress changes
  useEffect(() => {
    generateNodes();
    generateEdges();
  }, [progress, generateNodes, generateEdges]);

  // Save progress to Supabase
  const saveToSupabase = useCallback(async (newProgress: Record<string, boolean>) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('roadmap')
        .upsert(
          { user_id: user.id, progress: newProgress },
          { onConflict: 'user_id' }
        );
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving to Supabase:', error);
    }
  }, [user, supabase]);

  // Debounced save function  
  const debouncedSave = useCallback(() => {
    return createDebouncedFunction(saveToSupabase);
  }, [saveToSupabase]);

  // Load roadmap progress
  const loadRoadmap = useCallback(async () => {
    try {
      if (!hasLoadedRef.current) {
        setLoading(true);
      }

      if (isGuestMode || !user) {
        // Handle guest mode - load from localStorage
        const savedProgress = localStorage.getItem('studentRoadmap');
        const loadedProgress = savedProgress ? JSON.parse(savedProgress) : DEFAULT_PROGRESS;
        setProgress(loadedProgress);
        hasLoadedRef.current = true;
        setLoading(false);
        return;
      }

      // User is authenticated - load from Supabase
      const { data, error } = await supabase
        .from('roadmap')
        .select('progress')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching roadmap:', error.message);
        setProgress(DEFAULT_PROGRESS);
        hasLoadedRef.current = true;
        setLoading(false);
        return;
      }

      if (!data) {
        // Create new roadmap entry using UPSERT to avoid duplicate key errors
        const localProgress = localStorage.getItem('studentRoadmap');
        const progressToUse = localProgress ? JSON.parse(localProgress) : DEFAULT_PROGRESS;
        
        const { data: newData, error: upsertError } = await supabase
          .from('roadmap')
          .upsert(
            { user_id: user.id, progress: progressToUse },
            { onConflict: 'user_id' }
          )
          .select('progress')
          .single();

        if (upsertError) {
          console.error('Error creating/updating roadmap:', upsertError.message);
          setProgress(DEFAULT_PROGRESS);
        } else {
          setProgress(newData.progress || DEFAULT_PROGRESS);
          
          // Clear localStorage after migration
          if (localProgress) {
            localStorage.removeItem('studentRoadmap');
          }
        }
      } else {
        setProgress(data.progress || DEFAULT_PROGRESS);
      }

      hasLoadedRef.current = true;
    } catch (err) {
      console.error('Error in loadRoadmap:', err);
      setProgress(DEFAULT_PROGRESS);
      hasLoadedRef.current = true;
    } finally {
      setLoading(false);
    }
  }, [isGuestMode, user, supabase]);

  // Handle toggle for roadmap steps
  const handleToggle = useCallback((sectionId: string, stepIndex: number) => {
    try {
      const key = `${sectionId}-${stepIndex}`;
      const newProgress = { ...progress, [key]: !progress[key] };
      setProgress(newProgress);

      if (isGuestMode || !user) {
        localStorage.setItem('studentRoadmap', JSON.stringify(newProgress));
      } else if (user) {
        const saveFunction = debouncedSave();
        saveFunction(newProgress);
      }
    } catch (error) {
      console.error('Error updating roadmap progress:', error);
    }
  }, [progress, isGuestMode, user, debouncedSave]);

  // Get section by ID
  const getSection = useCallback((nodeId: string): RoadmapSection | null => {
    return roadmapSections.find((s) => s.id === nodeId) || null;
  }, [roadmapSections]);

  return {
    nodes,
    edges,
    progress,
    loading,
    loadRoadmap,
    handleToggle,
    getSection,
    hasLoaded: hasLoadedRef.current
  };
}