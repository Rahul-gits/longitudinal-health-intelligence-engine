import React, { useState } from 'react';
import { 
  INITIAL_DATA_CLUSTERS, 
  KNOWLEDGE_GRAPH_NODES, 
  KNOWLEDGE_GRAPH_EDGES 
} from '../data/mockPatientData';
import { ClusterType, ClusterNode, DataClusterItem } from '../types/health';
import { 
  Activity, 
  History, 
  FileText, 
  Pill, 
  HeartPulse, 
  AlertTriangle, 
  CheckCircle, 
  Sparkles, 
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';

interface DataClusterGraphProps {
  activeCitedClusters?: ClusterType[];
  activeCitedNodeIds?: string[];
  onSelectNode?: (node: ClusterNode) => void;
}

export const DataClusterGraph: React.FC<DataClusterGraphProps> = ({
  activeCitedClusters = [],
  activeCitedNodeIds = [],
  onSelectNode
}) => {
  const [selectedNode, setSelectedNode] = useState<ClusterNode | null>(KNOWLEDGE_GRAPH_NODES[4]);
  const [activeClusterFilter, setActiveClusterFilter] = useState<string>('all');

  const getClusterIcon = (clusterId: ClusterType) => {
    switch (clusterId) {
      case 'symptoms': return Activity;
      case 'history': return History;
      case 'reports': return FileText;
      case 'medication': return Pill;
      case 'lifestyle': return HeartPulse;
      case 'risk': return AlertTriangle;
      case 'recovery': return CheckCircle;
      default: return Layers;
    }
  };

  const getClusterColor = (clusterId: ClusterType) => {
    switch (clusterId) {
      case 'symptoms': return { stroke: '#F43F5E', fill: 'rgba(244, 63, 94, 0.15)', text: 'text-rose-400', border: 'border-rose-500/40' };
      case 'history': return { stroke: '#3B82F6', fill: 'rgba(59, 130, 246, 0.15)', text: 'text-blue-400', border: 'border-blue-500/40' };
      case 'reports': return { stroke: '#06B6D4', fill: 'rgba(6, 182, 212, 0.15)', text: 'text-cyan-400', border: 'border-cyan-500/40' };
      case 'medication': return { stroke: '#8B5CF6', fill: 'rgba(139, 92, 246, 0.15)', text: 'text-purple-400', border: 'border-purple-500/40' };
      case 'lifestyle': return { stroke: '#10B981', fill: 'rgba(16, 185, 129, 0.15)', text: 'text-emerald-400', border: 'border-emerald-500/40' };
      case 'risk': return { stroke: '#F59E0B', fill: 'rgba(245, 158, 11, 0.15)', text: 'text-amber-400', border: 'border-amber-500/40' };
      case 'recovery': return { stroke: '#6366F1', fill: 'rgba(99, 102, 241, 0.15)', text: 'text-indigo-400', border: 'border-indigo-500/40' };
      default: return { stroke: '#94A3B8', fill: 'rgba(148, 163, 184, 0.15)', text: 'text-slate-400', border: 'border-slate-500/40' };
    }
  };

  const handleNodeClick = (node: ClusterNode) => {
    setSelectedNode(node);
    if (onSelectNode) onSelectNode(node);
  };

  return (
    <div className="flex flex-col h-full bg-[#131B2E]/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Panel 2: Dynamic Patient Data Cluster Graph
            </h3>
            <p className="text-[11px] text-slate-400">7 Connected Data Clusters & Inter-Node Relationships</p>
          </div>
        </div>

        {/* Cluster Selector Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveClusterFilter('all')}
            className={`px-2 py-0.5 text-[10px] rounded font-medium transition-all ${
              activeClusterFilter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Clusters
          </button>
          {INITIAL_DATA_CLUSTERS.map(cluster => (
            <button
              key={cluster.id}
              onClick={() => setActiveClusterFilter(cluster.id)}
              className={`px-2 py-0.5 text-[10px] rounded font-medium transition-all whitespace-nowrap ${
                activeClusterFilter === cluster.id
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cluster.title.split('—')[1]?.trim() || cluster.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="relative flex-1 bg-[#0B0F19]/90 overflow-hidden min-h-[360px]">
        {/* SVG Inter-Cluster Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {KNOWLEDGE_GRAPH_EDGES.map(edge => {
            const sourceNode = KNOWLEDGE_GRAPH_NODES.find(n => n.id === edge.source);
            const targetNode = KNOWLEDGE_GRAPH_NODES.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            const isHighlighted = activeCitedNodeIds.includes(edge.source) || activeCitedNodeIds.includes(edge.target);

            return (
              <g key={edge.id}>
                <line
                  x1={`${(sourceNode.x / 850) * 100}%`}
                  y1={`${(sourceNode.y / 400) * 100}%`}
                  x2={`${(targetNode.x / 850) * 100}%`}
                  y2={`${(targetNode.y / 400) * 100}%`}
                  stroke={isHighlighted ? 'url(#edgeGrad)' : 'rgba(148, 163, 184, 0.2)'}
                  strokeWidth={isHighlighted ? 3 : 1.5}
                  strokeDasharray={isHighlighted ? '6 3' : 'none'}
                  className={isHighlighted ? 'animate-pulse' : ''}
                  filter={isHighlighted ? 'url(#glow)' : undefined}
                />
                {/* Edge Label */}
                {isHighlighted && (
                  <text
                    x={`${((sourceNode.x + targetNode.x) / 2 / 850) * 100}%`}
                    y={`${((sourceNode.y + targetNode.y) / 2 / 400) * 100}%`}
                    fill="#06B6D4"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="bg-slate-900 px-1 font-mono"
                  >
                    {edge.relationship}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes Layer */}
        <div className="absolute inset-0 p-4">
          {KNOWLEDGE_GRAPH_NODES.map(node => {
            const isClusterActive = activeCitedClusters.includes(node.clusterId as ClusterType);
            const isNodeActive = activeCitedNodeIds.includes(node.id);
            const isSelected = selectedNode?.id === node.id;
            const styleProps = getClusterColor(node.clusterId as ClusterType);

            if (activeClusterFilter !== 'all' && activeClusterFilter !== node.clusterId) {
              return null;
            }

            return (
              <button
                key={node.id}
                onClick={() => handleNodeClick(node)}
                style={{
                  left: `${(node.x / 850) * 88}%`,
                  top: `${(node.y / 400) * 80}%`
                }}
                className={`absolute transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 group ${
                  isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-20'
                }`}
              >
                {/* Glowing Aura when cited by active AI persona */}
                {(isClusterActive || isNodeActive) && (
                  <span className="absolute -inset-2 rounded-xl bg-cyan-500/30 blur-md animate-pulse"></span>
                )}

                {/* Node Box */}
                <div className={`relative px-3 py-2 rounded-xl border backdrop-blur-md transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/20'
                    : isNodeActive || isClusterActive
                    ? 'bg-slate-900/90 border-cyan-500 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      node.status === 'critical' ? 'bg-rose-500 animate-ping' :
                      node.status === 'abnormal' ? 'bg-amber-400' :
                      node.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-400'
                    }`}></span>
                    <span className="text-xs font-bold text-white tracking-tight">{node.label}</span>
                  </div>
                  <div className="flex items-center justify-between space-x-2 mt-1">
                    <span className="text-[10px] text-slate-400 font-mono">{node.type}</span>
                    <span className={`text-[10px] font-semibold ${styleProps.text}`}>{node.value}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend Overlay at Bottom */}
        <div className="absolute bottom-2 left-2 right-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-slate-300">Active Persona Citation Sync:</span>
            <div className="flex items-center space-x-2">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span> Cited Cluster</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Critical Flag</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Normal Baseline</span>
            </div>
          </div>
          <span className="hidden md:inline text-[10px] text-slate-400">Click any node to inspect data provenance</span>
        </div>
      </div>

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Info className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-sm">{selectedNode.label}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-cyan-300">
                  {selectedNode.clusterId.toUpperCase()} CLUSTER
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">{selectedNode.details}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div>
              <span className="text-slate-500 text-[10px] block">CURRENT VALUE</span>
              <span className="font-semibold text-amber-300 font-mono">{selectedNode.value}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">PROVENANCE</span>
              <span className="font-medium text-slate-300">EHR & Lab Extraction (98% Conf)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
