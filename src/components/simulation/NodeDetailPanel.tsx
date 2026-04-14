import { useEffect, useRef } from 'react';
import type { SimulationGraph, GraphNode } from '@/types/simulation';
import { NODE_COLORS, NODE_LABELS } from '@/types/simulation';

interface NodeDetailPanelProps {
  nodeId: string | null;
  graph: SimulationGraph;
  completedSteps: Record<string, boolean[]>;
  onToggleStep: (nodeId: string, stepIndex: number) => void;
  onClose: () => void;
  onExpandNode?: (nodeId: string) => void;
  isExpanding?: boolean;
}

export default function NodeDetailPanel({
  nodeId,
  graph,
  completedSteps,
  onToggleStep,
  onClose,
  onExpandNode,
  isExpanding,
}: NodeDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  const node: GraphNode | undefined = graph.nodes.find((n) => n.id === nodeId);
  const detail = nodeId ? graph.nodeDetails?.[nodeId] : undefined;
  const steps = detail?.steps ?? [];
  const myCompletedSteps = (nodeId ? completedSteps[nodeId] : undefined) ?? [];

  const completedCount = myCompletedSteps.filter(Boolean).length;
  const progress = steps.length ? Math.round((completedCount / steps.length) * 100) : 0;
  const isParent = nodeId ? graph.nodes.some(n => {
    const legacyParent = (n as any).parentId;
    const parents = Array.from(new Set([...(n.parentIds || []), ...(legacyParent ? [legacyParent] : [])]));
    return parents.includes(nodeId);
  }) : false;

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const isOpen = !!nodeId;

  return (
    <>
      {/* Backdrop (mobile) */}
      {isOpen && (
        <div
          className="absolute inset-0 bg-black/40 z-30 sm:hidden"
          onClick={onClose}
        />
      )}

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        className={`
          absolute top-0 right-0 h-full w-full sm:w-[340px] bg-gray-900 shadow-2xl border-l border-gray-800 z-40
          transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-800 bg-gray-800/50">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
              Relationship
            </p>
            {node && (
              <>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                    style={{ backgroundColor: NODE_COLORS[node.type] || '#94a3b8' }}
                  >
                    {NODE_LABELS[node.type] || (node.type ? node.type.charAt(0).toUpperCase() + node.type.slice(1) : 'Unknown')}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full border font-medium"
                    style={{
                      borderColor: statusColor(node.status),
                      color: statusColor(node.status),
                    }}
                  >
                    {node.status.replace('_', ' ')}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white leading-snug break-words">
                  {detail?.title ?? node.label}
                </h2>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors text-white shadow-sm"
            title="Close Sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {!node && (
            <div className="text-center text-gray-500 py-12">
              <p>Select a node from the graph to see details</p>
            </div>
          )}

          {node && detail && (
            <>
              {/* Description */}
              {detail.description && (
                <p className="text-sm text-gray-300 leading-relaxed">{detail.description}</p>
              )}

              {/* Expansion Instruction for Parent Nodes */}
              {isParent ? (
                <div className="bg-blue-900/20 border border-blue-900/50 rounded-xl p-5 text-center mt-6">
                  <div className="bg-blue-800/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-blue-100 mb-1">Expandable Topic</h3>
                  <p className="text-xs text-blue-300/80 leading-relaxed">
                    This is a broad category. Click this node on the graph canvas to reveal its specific sub-skills and trackable steps.
                  </p>
                </div>
              ) : (
                <>
                  {/* Progress bar */}
                  {steps.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Progress
                        </span>
                        <span className="text-xs font-bold" style={{ color: NODE_COLORS[node.type] || '#94a3b8' }}>
                          {completedCount}/{steps.length} steps · {progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: NODE_COLORS[node.type] || '#94a3b8',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step checklist */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Steps
                    </p>
                    <ol className="space-y-2">
                      {steps.map((step, i) => {
                        const done = myCompletedSteps[i] ?? false;
                        return (
                          <li key={i}>
                            <button
                              onClick={() => nodeId && onToggleStep(nodeId, i)}
                              className={`
                                w-full flex items-start gap-3 text-left p-3 rounded-xl border transition-all
                                ${done
                                  ? 'bg-green-900/20 border-green-900/50 text-gray-400'
                                  : 'bg-gray-800 border-gray-700 hover:border-blue-500/50 hover:bg-blue-900/20 text-gray-200'
                                }
                              `}
                            >
                              {/* Checkbox */}
                              <div
                                className={`
                                  shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors
                                  ${done ? 'bg-green-500 border-green-500' : 'border-gray-600 bg-gray-900'}
                                `}
                              >
                                {done && (
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>

                              <span className={`text-sm leading-relaxed ${done ? 'line-through opacity-60' : ''}`}>
                                <span className="font-medium text-xs text-gray-500 mr-1.5">
                                  {i + 1}.
                                </span>
                                {step.replace(/^Step \d+:\s*/i, '')}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  </div>

                  {/* AI Generate Sub-nodes Button */}
                  <div className="pt-4 border-t border-gray-800 mt-2">
                    <button
                      onClick={() => nodeId && onExpandNode?.(nodeId)}
                      disabled={isExpanding}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all disabled:opacity-75 disabled:cursor-wait text-indigo-400 bg-indigo-900/20 hover:bg-indigo-900/40 border border-indigo-700/50 hover:border-indigo-500/70"
                    >
                      {isExpanding ? (
                        <>
                          <svg className="animate-spin h-5 w-5 border-2 border-indigo-400 border-t-transparent rounded-full" viewBox="0 0 24 24" />
                          <span>AI is generating sub-skills...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                          <span>Generate Sub-Skills with AI</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* Completion celebration */}
              {progress === 100 && (
                <div className="bg-green-900/20 border border-green-900/50 rounded-xl p-4 text-center">
                  <p className="text-2xl mb-1">🎉</p>
                  <p className="text-sm font-semibold text-green-400">Node Completed!</p>
                  <p className="text-xs text-green-500/80 mt-0.5">Keep going &mdash; you&apos;re making great progress!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function statusColor(status: string): string {
  switch (status) {
    case 'have': return '#22c55e';
    case 'in_progress': return '#f59e0b';
    case 'missing': return '#ef4444';
    case 'target': return '#eab308';
    default: return '#6b7280';
  }
}
