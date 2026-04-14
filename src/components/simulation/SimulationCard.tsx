import { useRouter } from 'next/router';
import type { SimulationDoc } from '@/types/simulation';
import { NODE_COLORS } from '@/types/simulation';

interface SimulationCardProps {
  simulation: SimulationDoc;
  index: number;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export default function SimulationCard({ simulation, index, onDelete, isDeleting }: SimulationCardProps) {
  const router = useRouter();

  const nodeTypeCounts = simulation.graph.nodes.reduce<Record<string, number>>((acc, node) => {
    acc[node.type] = (acc[node.type] ?? 0) + 1;
    return acc;
  }, {});

  const totalNodes = simulation.graph.nodes.length;
  const completedCount = simulation.completedNodes?.length ?? 0;
  const progress = totalNodes > 0 ? Math.round((completedCount / totalNodes) * 100) : 0;

  const createdDate = simulation.createdAt?.seconds
    ? new Date(simulation.createdAt.seconds * 1000).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : '—';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 flex flex-col gap-4 hover:border-blue-500/50 hover:bg-gray-800/80 transition-all duration-200 group">
      {/* Index badge + goal */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="
            shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
            bg-gradient-to-br from-blue-600 to-purple-600 text-white
          ">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-0.5">Goal</p>
            <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
              {simulation.goal}
            </h3>
          </div>
        </div>
        <span className="shrink-0 text-xs text-gray-500 mt-0.5">{createdDate}</span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs flex-wrap">
        <span className="px-2.5 py-1 rounded-full bg-gray-700 text-gray-300 font-medium">
          {totalNodes} nodes
        </span>
        <span className="px-2.5 py-1 rounded-full bg-gray-700 text-gray-300 font-medium">
          {simulation.graph.edges.length} connections
        </span>
        {simulation.profile?.name && (
          <span className="px-2.5 py-1 rounded-full bg-blue-900/40 text-blue-300 font-medium">
            {simulation.profile.name}
          </span>
        )}
      </div>

      {/* Node type colour bar */}
      {totalNodes > 0 && (
        <div className="flex h-2 rounded-full overflow-hidden gap-px">
          {Object.entries(nodeTypeCounts).map(([type, count]) => (
            <div
              key={type}
              title={`${type}: ${count}`}
              className="h-full transition-all"
              style={{
                width: `${(count / totalNodes) * 100}%`,
                backgroundColor: NODE_COLORS[type as import('@/types/simulation').NodeType] ?? '#6b7280',
              }}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
          <span>Completion</span>
          <span className="font-semibold text-gray-400">{completedCount}/{totalNodes} nodes · {progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => router.push(`/simulation/${simulation.id}`)}
          className="flex-1 py-2 px-4 rounded-xl text-sm font-semibold text-white
            bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
            transition-all shadow-sm hover:shadow-blue-500/25 flex items-center justify-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Open Graph
        </button>
        <button
          onClick={() => !isDeleting && onDelete(simulation.id)}
          disabled={isDeleting}
          className="px-3 py-2 rounded-xl text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20
            transition-colors disabled:opacity-40 shrink-0"
          title="Delete simulation"
        >
          {isDeleting ? (
            <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
