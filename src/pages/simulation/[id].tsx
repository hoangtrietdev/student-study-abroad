import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import SEO from '@/components/SEO';
import LoadingSpinner from '@/components/LoadingSpinner';
import GraphCanvas from '@/components/simulation/GraphCanvas';
import NodeDetailPanel from '@/components/simulation/NodeDetailPanel';
import type { SimulationDoc } from '@/types/simulation';

export default function SimulationDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { user, loading: authLoading } = useAuth();

  const [simulation, setSimulation] = useState<SimulationDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [expandingNodes, setExpandingNodes] = useState<Set<string>>(new Set());
  const [notFound, setNotFound] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user && id !== 'guest') {
      router.push('/login');
    }
  }, [user, authLoading, router, id]);

  // Load simulation
  useEffect(() => {
    if (!id || authLoading) return;
    
    (async () => {
      setLoading(true);
      try {
        if (id === 'guest') {
          const customData = localStorage.getItem('guest_simulation_data');
          if (customData) {
            setSimulation(JSON.parse(customData));
          } else {
            setNotFound(true);
          }
        } else {
          // If auth hasn't resolved but we aren't guest, the guard above will catch it.
          // But just to be safe:
          if (!user) return;
          const snap = await getDoc(doc(db, 'simulations', id));
          if (!snap.exists() || snap.data()?.userId !== user.uid) {
            setNotFound(true);
            return;
          }
          setSimulation({ id: snap.id, ...snap.data() } as SimulationDoc);
        }
      } catch (err) {
        console.error('Error loading simulation:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user, authLoading]);

  const handleToggleExpand = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const handleGenerateExpansion = useCallback(async (nodeId: string) => {
    if (!simulation) return;
    
    // Auto-expand if already has children
    const getParents = (n: any) => Array.from(new Set([...(n.parentIds || []), ...(n.parentId ? [n.parentId] : [])])) as string[];
    const hasChildren = simulation.graph.nodes.some(n => getParents(n).includes(nodeId));
    if (hasChildren) {
      handleToggleExpand(nodeId);
      return;
    }

    setExpandingNodes(prev => new Set(prev).add(nodeId));

    try {
      const parentNode = simulation.graph.nodes.find(n => n.id === nodeId);
      if (!parentNode) throw new Error('Parent not found');

      const res = await fetch('/api/simulation/expand-node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: simulation.profile,
          goal: simulation.goal,
          parentNode,
        }),
      });

      if (!res.ok) throw new Error('Failed to expand');
      const data = await res.json();

      let newGraph = simulation.graph;

      setSimulation(prev => {
        if (!prev) return prev;
        const newNodes = [...prev.graph.nodes, ...(data.nodes || [])];
        const newEdges = [...prev.graph.edges, ...(data.edges || [])];
        const newNodeDetails = { ...prev.graph.nodeDetails, ...(data.nodeDetails || {}) };
        
        newGraph = {
            nodes: newNodes,
            edges: newEdges,
            nodeDetails: newNodeDetails,
        };

        return {
          ...prev,
          graph: newGraph
        };
      });

      setExpandedNodes(prev => new Set(prev).add(nodeId));
      
      // Persist the permanently expanded graph structure
      if (simulation.id === 'guest') {
        const updatedSim = { ...simulation, graph: newGraph, updatedAt: { seconds: Math.floor(Date.now() / 1000) } };
        localStorage.setItem('guest_simulation_data', JSON.stringify(updatedSim));
      } else {
        await updateDoc(doc(db, 'simulations', simulation.id), {
          graph: newGraph,
          updatedAt: serverTimestamp(),
        });
      }

    } catch (e) {
      console.error(e);
      alert('Failed to generate sub-nodes. Please try again.');
    } finally {
      setExpandingNodes(prev => {
        const next = new Set(prev);
        next.delete(nodeId);
        return next;
      });
    }
  }, [simulation, handleToggleExpand]);

  // Toggle step completion
  const handleToggleStep = useCallback(async (nodeId: string, stepIndex: number) => {
    if (!simulation) return;

    const prevSteps = simulation.completedSteps?.[nodeId] ?? [];
    const newSteps = [...prevSteps];
    newSteps[stepIndex] = !newSteps[stepIndex];

    const allDone = newSteps.every(Boolean) &&
      newSteps.length === (simulation.graph.nodeDetails?.[nodeId]?.steps?.length ?? 0);

    const newCompletedNodes = allDone
      ? Array.from(new Set([...(simulation.completedNodes ?? []), nodeId]))
      : (simulation.completedNodes ?? []).filter((n) => n !== nodeId);

    const newCompletedSteps = {
      ...(simulation.completedSteps ?? {}),
      [nodeId]: newSteps,
    };

    // Optimistic update
    setSimulation((prev) =>
      prev
        ? { ...prev, completedNodes: newCompletedNodes, completedSteps: newCompletedSteps }
        : prev
    );

    // Persist to Firebase or LocalStorage
    try {
      if (simulation.id === 'guest') {
        const updatedSim = {
          ...simulation,
          completedNodes: newCompletedNodes,
          completedSteps: newCompletedSteps,
          updatedAt: { seconds: Math.floor(Date.now() / 1000) }
        };
        localStorage.setItem('guest_simulation_data', JSON.stringify(updatedSim));
      } else {
        await updateDoc(doc(db, 'simulations', simulation.id), {
          completedNodes: newCompletedNodes,
          completedSteps: newCompletedSteps,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  }, [simulation]);

  const visibleGraph = useMemo(() => {
    if (!simulation) return { nodes: [], edges: [], nodeDetails: {} };

    // Helper: gets all parents (legacy + new array)
    const getParents = (n: any) => Array.from(new Set([...(n.parentIds || []), ...(n.parentId ? [n.parentId] : [])])) as string[];

    // 1. Safety check: clear hallucinated parentIds
    const nodeIds = new Set(simulation.graph.nodes.map(n => n.id));
    const safeNodes = simulation.graph.nodes.map(n => {
      let parents = getParents(n);
      parents = parents.filter(pid => nodeIds.has(pid));
      return { ...n, parentIds: parents, parentId: undefined }; // Normalize to parentIds
    });

    // 2. Recursive visibility check (if any grandparent is closed, child is hidden)
    const isVisible = (nodeId: string): boolean => {
      const node = safeNodes.find(n => n.id === nodeId);
      if (!node) return false;
      const parents = node.parentIds || [];
      if (parents.length === 0) return true;
      // For multiple parents, if AT LEAST ONE ancestry tree is fully visible, the node is visible.
      return parents.some(pid => expandedNodes.has(pid) && isVisible(pid));
    };

    const visibleNodes = safeNodes.filter(n => isVisible(n.id));
    const visibleIds = new Set(visibleNodes.map(n => n.id));

    // 3. Filter edges
    const visibleEdges = simulation.graph.edges.filter(e => {
      const srcId = typeof e.source === 'string' ? e.source : (e.source as any).id;
      const tgtId = typeof e.target === 'string' ? e.target : (e.target as any).id;
      return visibleIds.has(srcId) && visibleIds.has(tgtId);
    });

    // 4. Force top-level nodes to connect to the Goal node
    const goalNode = visibleNodes.find(n => n.type === 'goal');
    const enrichedEdges = [...visibleEdges];

    if (goalNode) {
      const topLevelNodes = visibleNodes.filter(n => (!n.parentIds || n.parentIds.length === 0) && n.id !== goalNode.id);
      
      topLevelNodes.forEach(n => {
        const hasGoalLink = enrichedEdges.some(e => {
          const srcId = typeof e.source === 'string' ? e.source : (e.source as any).id;
          const tgtId = typeof e.target === 'string' ? e.target : (e.target as any).id;
          return (srcId === n.id && tgtId === goalNode.id) || (tgtId === n.id && srcId === goalNode.id);
        });

        if (!hasGoalLink) {
          enrichedEdges.push({
            id: `auto_${n.id}_goal`,
            source: n.id,
            target: goalNode.id,
            label: 'SUPPORTS'
          });
        }
      });
    }

    // 5. Force child nodes to connect to their Parent nodes if the AI missed it
    visibleNodes.forEach(n => {
      const parents = n.parentIds || [];
      parents.forEach(pid => {
        const hasParentLink = enrichedEdges.some(e => {
          const srcId = typeof e.source === 'string' ? e.source : (e.source as any).id;
          const tgtId = typeof e.target === 'string' ? e.target : (e.target as any).id;
          return (srcId === n.id && tgtId === pid) || (tgtId === n.id && srcId === pid);
        });

        if (!hasParentLink) {
          enrichedEdges.push({
            id: `auto_${n.id}_parent_${pid}`,
            source: pid,
            target: n.id,
            label: 'INCLUDES'
          });
        }
      });
    });

    return {
      ...simulation.graph,
      nodes: visibleNodes,
      edges: enrichedEdges,
    };
  }, [simulation, expandedNodes]);

  const parentIds = useMemo(() => {
    if (!simulation) return new Set<string>();
    const getParents = (n: any) => Array.from(new Set([...(n.parentIds || []), ...(n.parentId ? [n.parentId] : [])])) as string[];
    const allParents = simulation.graph.nodes.flatMap(n => getParents(n));
    return new Set(allParents);
  }, [simulation]);

  if (authLoading || loading) {
    return (
      <MainLayout showHeader={false} showFooter={false}>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-400">Loading simulation…</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (notFound) {
    return (
      <MainLayout title="Not Found">
        <div className="flex h-[70vh] items-center justify-center">
          <div className="text-center">
            <p className="text-5xl mb-4">🔍</p>
            <h2 className="text-xl font-bold text-white mb-2">Simulation not found</h2>
            <p className="text-gray-400 mb-6">This simulation doesn&apos;t exist or you don&apos;t have access.</p>
            <button
              onClick={() => router.push('/simulation')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              Back to Simulations
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!simulation) return null;

  const totalNodes = simulation.graph.nodes.length;
  const completedCount = simulation.completedNodes?.length ?? 0;
  const progress = totalNodes > 0 ? Math.round((completedCount / totalNodes) * 100) : 0;

  return (
    <>
      <SEO
        title={`${simulation.goal.slice(0, 60)} — Career Graph`}
        description="Explore your personalised career knowledge graph and track your progress step by step."
      />

      <MainLayout>
        <div className="flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>

          {/* Top bar */}
          <div className="flex items-center gap-3 px-3 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
            <button
              onClick={() => router.push('/simulation')}
              className="text-gray-400 hover:text-white transition-colors shrink-0"
              title="Back to simulations"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex-1 min-w-0 flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Goal</p>
                <p className="text-sm font-semibold text-white truncate">{simulation.goal}</p>
              </div>
              {simulation.id === 'guest' && (
                <span className="hidden sm:inline-flex shrink-0 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-900/40 border border-blue-700/50 rounded-full">
                  Guest
                </span>
              )}
            </div>

            {/* Progress pill */}
            <div className="flex flex-col items-end sm:flex-row sm:items-center gap-1 sm:gap-2 shrink-0 ml-1">
              <div className="w-16 sm:w-28 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] sm:text-xs text-gray-400 font-medium whitespace-nowrap">
                <span className="hidden sm:inline">{completedCount}/{totalNodes} · </span>{progress}%
              </span>
            </div>
          </div>

          {/* Graph area */}
          <div className="flex-1 relative overflow-hidden bg-gray-900">
            <GraphCanvas
              graph={visibleGraph}
              completedNodes={simulation.completedNodes ?? []}
              onNodeClick={setSelectedNodeId}
              selectedNodeId={selectedNodeId}
              parentIds={parentIds}
              expandedNodes={expandedNodes}
              onNodeToggle={handleToggleExpand}
            />

            {/* Node detail panel */}
            <NodeDetailPanel
              nodeId={selectedNodeId}
              graph={simulation.graph}
              completedSteps={simulation.completedSteps ?? {}}
              onToggleStep={handleToggleStep}
              onClose={() => setSelectedNodeId(null)}
              onExpandNode={handleGenerateExpansion}
              isExpanding={selectedNodeId ? expandingNodes.has(selectedNodeId) : false}
            />
          </div>
        </div>
      </MainLayout>
    </>
  );
}

export const getStaticPaths: import('next').GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: import('next').GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'roadmap'])),
    },
  };
};
