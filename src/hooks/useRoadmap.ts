import { useState, useCallback, useRef, useEffect } from 'react';
import { Node, Edge, Position, MarkerType } from 'reactflow';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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

  // Save progress to Firebase Firestore
  const saveToFirestore = useCallback(async (newProgress: Record<string, boolean>) => {
    if (!user || !db) return;
    try {
      const userDocRef = doc(db, 'roadmaps', user.uid);
      await setDoc(userDocRef, {
        userId: user.uid,
        progress: newProgress,
        updatedAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving to Firestore:', error);
    }
  }, [user]);

  // Debounced save function  
  const debouncedSave = useCallback(() => {
    return createDebouncedFunction(saveToFirestore);
  }, [saveToFirestore]);

  // Load roadmap progress
  const loadRoadmap = useCallback(async () => {
    try {
      if (!hasLoadedRef.current) {
        setLoading(true);
      }

      if (isGuestMode || !user || !db) {
        // Handle guest mode or Firebase not available - load from localStorage
        const savedProgress = localStorage.getItem('studentRoadmap');
        const loadedProgress = savedProgress ? JSON.parse(savedProgress) : DEFAULT_PROGRESS;
        setProgress(loadedProgress);
        hasLoadedRef.current = true;
        setLoading(false);
        return;
      }

      // User is authenticated - load from Firestore
      const userDocRef = doc(db, 'roadmaps', user.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        // Create new roadmap entry
        const localProgress = localStorage.getItem('studentRoadmap');
        const progressToUse = localProgress ? JSON.parse(localProgress) : DEFAULT_PROGRESS;
        
        await setDoc(userDocRef, {
          userId: user.uid,
          progress: progressToUse,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        setProgress(progressToUse);
        
        // Clear localStorage after migration
        if (localProgress) {
          localStorage.removeItem('studentRoadmap');
        }
      } else {
        const data = docSnap.data();
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
  }, [isGuestMode, user]);

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