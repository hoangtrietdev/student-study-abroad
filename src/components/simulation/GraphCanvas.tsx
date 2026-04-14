import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import type { GraphNode, SimulationGraph } from '@/types/simulation';
import { NODE_COLORS, NODE_LABELS } from '@/types/simulation';

// D3-compatible node (x/y/vx/vy managed by D3 force sim)
interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: GraphNode['type'];
  status: GraphNode['status'];
  importance?: number;
}

// D3-compatible link
interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  id: string;
  label?: string;
}

interface GraphCanvasProps {
  graph: SimulationGraph;
  completedNodes: string[];
  onNodeClick: (nodeId: string) => void;
  selectedNodeId?: string | null;
  parentIds?: Set<string>;
  expandedNodes?: Set<string>;
  onNodeToggle?: (nodeId: string) => void;
}

export default function GraphCanvas({
  graph,
  completedNodes,
  onNodeClick,
  selectedNodeId,
  parentIds,
  expandedNodes,
  onNodeToggle,
}: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeCoords = useRef(new Map<string, { x: number; y: number }>());

  const draw = useCallback(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const svg = d3.select<SVGSVGElement, unknown>(svgEl);
    svg.selectAll('*').remove();

    const width = svgEl.clientWidth || 900;
    const height = svgEl.clientHeight || 700;

    // Build typed node/link arrays for D3
    const nodes: SimNode[] = graph.nodes.map((n) => {
      const saved = nodeCoords.current.get(n.id);
      return {
        id: n.id,
        label: n.label,
        type: n.type,
        status: n.status,
        importance: n.importance,
        x: saved ? saved.x : width / 2 + (Math.random() - 0.5) * 50,
        y: saved ? saved.y : height / 2 + (Math.random() - 0.5) * 50,
      };
    });

    const nodeById = new Map(nodes.map((n) => [n.id, n]));

    const normalizedEdges = graph.edges.map(e => ({
      ...e,
      source: typeof e.source === 'string' ? e.source : (e.source as any).id,
      target: typeof e.target === 'string' ? e.target : (e.target as any).id,
    }));

    const links: SimLink[] = normalizedEdges
      .filter((e) => nodeById.has(e.source as string) && nodeById.has(e.target as string))
      .map((e) => ({
        id: e.id,
        label: e.label,
        source: nodeById.get(e.source as string)!,
        target: nodeById.get(e.target as string)!,
      }));

    // ── Zoom container ──────────────────────────────────────────────────────
    const g = svg.append('g');
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 3])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);

    // ── Arrow marker ────────────────────────────────────────────────────────
    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 24)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#475569')
      .attr('opacity', 0.8);

    // ── Force simulation ────────────────────────────────────────────────────
    const simulation = d3.forceSimulation<SimNode>(nodes)
      .force('link',
        d3.forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance(130)
      )
      .force('charge', d3.forceManyBody().strength(-380))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<SimNode>().radius((d) => nodeRadius(d) + 14));

    // ── Links ───────────────────────────────────────────────────────────────
    const link = g.append('g').selectAll<SVGLineElement, SimLink>('line')
      .data(links)
      .join('line')
      .attr('stroke', '#475569')
      .attr('stroke-width', 1.2)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrow)');

    // ── Edge labels ─────────────────────────────────────────────────────────
    const edgeLabel = g.append('g').selectAll<SVGTextElement, SimLink>('text')
      .data(links)
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', 8)
      .attr('fill', '#94a3b8')
      .attr('opacity', 0.8)
      .text((d) => d.label ?? '');

    // ── Node groups ─────────────────────────────────────────────────────────
    const nodeG = g.append('g').selectAll<SVGGElement, SimNode>('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, SimNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
          })
          .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null; d.fy = null;
          })
      )
      .on('click', (_event, d) => {
        onNodeClick(d.id);
        if (parentIds?.has(d.id) && onNodeToggle) {
          onNodeToggle(d.id);
        }
      });

    // Glow ring (selected / completed)
    nodeG.append('circle')
      .attr('r', (d) => nodeRadius(d) + 6)
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        if (d.id === selectedNodeId) return NODE_COLORS[d.type] || '#94a3b8';
        if (completedNodes.includes(d.id)) return '#22c55e';
        return 'none';
      })
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.65);

    // Main circle
    nodeG.append('circle')
      .attr('r', (d) => nodeRadius(d))
      .attr('fill', (d) => completedNodes.includes(d.id) ? '#22c55e' : (NODE_COLORS[d.type] || '#94a3b8'))
      .attr('stroke', '#111827')
      .attr('stroke-width', 1.5)
      .attr('fill-opacity', (d) => d.status === 'missing' ? 0.45 : 0.9)
      .attr('stroke-dasharray', (d) => d.status === 'missing' ? '3,2' : 'none');

    // Check mark for completed
    nodeG.filter((d) => completedNodes.includes(d.id))
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', (d) => nodeRadius(d) * 0.9)
      .attr('fill', '#fff')
      .text('✓');

    // Expansion Badge Background (Plus/Minus indicator)
    nodeG.filter((d) => parentIds?.has(d.id) || false)
      .append('circle')
      .attr('r', 8)
      .attr('cx', (d) => nodeRadius(d) - 4)
      .attr('cy', (d) => -nodeRadius(d) + 4)
      .attr('fill', '#1e293b')
      .attr('stroke', '#475569')
      .attr('stroke-width', 1.5);

    // Expansion Badge Text
    nodeG.filter((d) => parentIds?.has(d.id) || false)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('x', (d) => nodeRadius(d) - 4)
      .attr('y', (d) => -nodeRadius(d) + 4)
      .attr('font-size', 12)
      .attr('font-weight', 'bold')
      .attr('fill', '#94a3b8')
      .text((d) => expandedNodes?.has(d.id) ? '-' : '+');

    // Labels
    nodeG.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => nodeRadius(d) + 14)
      .attr('font-size', 10)
      .attr('font-family', 'Inter, system-ui, sans-serif')
      .attr('fill', '#e2e8f0')
      .attr('font-weight', 500)
      .text((d) => d.label.length > 22 ? d.label.slice(0, 20) + '…' : d.label);

    // ── Tick ────────────────────────────────────────────────────────────────
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as SimNode).x ?? 0)
        .attr('y1', (d) => (d.source as SimNode).y ?? 0)
        .attr('x2', (d) => (d.target as SimNode).x ?? 0)
        .attr('y2', (d) => (d.target as SimNode).y ?? 0);

      edgeLabel
        .attr('x', (d) => (((d.source as SimNode).x ?? 0) + ((d.target as SimNode).x ?? 0)) / 2)
        .attr('y', (d) => (((d.source as SimNode).y ?? 0) + ((d.target as SimNode).y ?? 0)) / 2);

      nodeG.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);

      // Persist coordinates for smooth re-renders
      nodes.forEach(n => {
        if (n.x != null && n.y != null) {
          nodeCoords.current.set(n.id, { x: n.x, y: n.y });
        }
      });
    });

    // Cleanup
    return () => { simulation.stop(); };
  }, [graph, completedNodes, selectedNodeId, onNodeClick]);

  useEffect(() => {
    const cleanup = draw();
    return cleanup;
  }, [draw]);

  useEffect(() => {
    const ro = new ResizeObserver(() => draw());
    if (svgRef.current?.parentElement) ro.observe(svgRef.current.parentElement);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <div className="relative w-full h-full bg-transparent rounded-xl overflow-hidden border border-gray-800">
      <svg ref={svgRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-3 text-xs max-h-[50vh] overflow-y-auto">
        <p className="font-semibold text-gray-300 mb-2 uppercase tracking-wide text-[10px]">Entity Types</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {(Object.entries(NODE_COLORS) as [GraphNode['type'], string][]).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-gray-400">{NODE_LABELS[type]}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-gray-800 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full shrink-0 bg-green-500" />
            <span className="text-gray-400">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full shrink-0 border-2 border-dashed border-gray-600 bg-gray-800" />
            <span className="text-gray-400">Missing</span>
          </div>
        </div>
      </div>

      {/* Hint */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-full px-4 py-1.5 text-xs text-gray-300 shadow pointer-events-none whitespace-nowrap">
        Click node for steps &nbsp;·&nbsp; Drag to explore &nbsp;·&nbsp; Scroll to zoom
      </div>
    </div>
  );
}

function nodeRadius(n: SimNode): number {
  const base = n.type === 'goal' ? 22 : 14;
  return base + ((n.importance ?? 5) - 5) * 1.5;
}
