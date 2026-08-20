import React, { useState } from 'react';
import { 
  INITIAL_DATA_CLUSTERS, 
  KNOWLEDGE_GRAPH_NODES, 
  KNOWLEDGE_GRAPH_EDGES,
  PERSONA_PROFILES 
} from '../data/mockPatientData';
import { ClusterType, ClusterNode, ClusterLensMode } from '../types/health';
import { clusteringEngine } from '../engine/clusteringEngine';
import { 
  Activity, 
  Layers, 
  Info, 
  Target, 
  ShieldAlert, 
  Sparkles, 
  Grid, 
  SlidersHorizontal,
  Compass
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
  const [lensMode, setLensMode] = useState<ClusterLensMode>('domain');
  const [kClusters, setKClusters] = useState<number>(4);

  const computedClusters = clusteringEngine.computeClusters(KNOWLEDGE_GRAPH_NODES, lensMode, kClusters);
  const analytics = clusteringEngine.computeAnalytics(KNOWLEDGE_GRAPH_NODES, lensMode);

  const getClusterColor = (clusterId: ClusterType) => {
    switch (clusterId) {
      case 'symptoms': return { bg: '#FF70A6', text: 'text-black' };
      case 'history': return { bg: '#3A86FF', text: 'text-white' };
      case 'reports': return { bg: '#00F5D4', text: 'text-black' };
      case 'medication': return { bg: '#8338EC', text: 'text-white' };
      case 'lifestyle': return { bg: '#CCFF00', text: 'text-black' };
      case 'risk': return { bg: '#FF6B35', text: 'text-black' };
      case 'recovery': return { bg: '#FFE600', text: 'text-black' };
      default: return { bg: '#FAF8F5', text: 'text-black' };
    }
  };

  const handleNodeClick = (node: ClusterNode) => {
    setSelectedNode(node);
    if (onSelectNode) onSelectNode(node);
  };

  const affectedPersona = selectedNode?.affectedPersonaId ? PERSONA_PROFILES[selectedNode.affectedPersonaId] : null;

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] overflow-hidden">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b-3 border-black bg-[#00F5D4] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-black text-[#00F5D4] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center rotate-2">
            <Layers className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm font-black font-display text-black uppercase tracking-wider">
              PANEL 2: PATIENT DATA CLUSTER GRAPH
            </h3>
            <p className="text-[10px] font-mono font-bold text-black/90">Multi-Lens Longitudinal Telemetry Clustering</p>
          </div>
        </div>

        {/* Cluster Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveClusterFilter('all')}
            className={`px-2.5 py-1 text-[10px] font-black uppercase border border-black transition-all cursor-pointer ${
              activeClusterFilter === 'all'
                ? 'bg-black text-[#FFE600] shadow-[1px_1px_0px_0px_#000]'
                : 'bg-white text-black hover:bg-[#FFE600]'
            }`}
          >
            All Nodes
          </button>
          {INITIAL_DATA_CLUSTERS.map(cluster => (
            <button
              key={cluster.id}
              onClick={() => setActiveClusterFilter(cluster.id)}
              className={`px-2 py-1 text-[10px] font-black uppercase border border-black transition-all whitespace-nowrap cursor-pointer ${
                activeClusterFilter === cluster.id
                  ? 'bg-black text-white shadow-[1px_1px_0px_0px_#000]'
                  : 'bg-white text-black hover:bg-[#FFE600]'
              }`}
            >
              {cluster.title.split('—')[1]?.trim() || cluster.title}
            </button>
          ))}
        </div>
      </div>

      {/* Clustering Lens Control & Analytics Bar */}
      <div className="px-4 py-2 bg-[#FAF8F5] border-b-2 border-black flex flex-wrap items-center justify-between gap-3 text-xs font-mono font-bold">
        {/* Lens Mode Switcher */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] font-black uppercase bg-black text-[#FFE600] px-2 py-0.5 border border-black flex items-center gap-1">
            <Compass className="w-3 h-3 stroke-[2.5]" />
            LENS MODE:
          </span>

          <button
            onClick={() => setLensMode('domain')}
            className={`px-2 py-0.5 text-[10px] font-black uppercase border border-black cursor-pointer transition-all ${
              lensMode === 'domain' ? 'bg-[#3A86FF] text-white shadow-[1px_1px_0px_0px_#000]' : 'bg-white hover:bg-[#FFE600]'
            }`}
          >
            Domain
          </button>

          <button
            onClick={() => setLensMode('goal_alignment')}
            className={`px-2 py-0.5 text-[10px] font-black uppercase border border-black cursor-pointer transition-all ${
              lensMode === 'goal_alignment' ? 'bg-[#A855F7] text-white shadow-[1px_1px_0px_0px_#000]' : 'bg-white hover:bg-[#FFE600]'
            }`}
          >
            Persona Goals
          </button>

          <button
            onClick={() => setLensMode('risk_severity')}
            className={`px-2 py-0.5 text-[10px] font-black uppercase border border-black cursor-pointer transition-all ${
              lensMode === 'risk_severity' ? 'bg-[#FF6B35] text-black shadow-[1px_1px_0px_0px_#000]' : 'bg-white hover:bg-[#FFE600]'
            }`}
          >
            Risk Heatmap
          </button>

          <button
            onClick={() => setLensMode('biomarker_correlation')}
            className={`px-2 py-0.5 text-[10px] font-black uppercase border border-black cursor-pointer transition-all ${
              lensMode === 'biomarker_correlation' ? 'bg-[#00F5D4] text-black shadow-[1px_1px_0px_0px_#000]' : 'bg-white hover:bg-[#FFE600]'
            }`}
          >
            Vector K-Means
          </button>
        </div>

        {/* Real-time Analytics Diagnostics */}
        <div className="flex items-center space-x-3 text-[10px] font-black">
          <span className="bg-[#FFFFFF] border border-black px-2 py-0.5">
            COHESION: <span className="text-[#3A86FF]">{analytics.cohesionIndex}%</span>
          </span>
          <span className="bg-[#FFFFFF] border border-black px-2 py-0.5">
            SILHOUETTE: <span className="text-[#00F5D4]">{analytics.silhouetteScore}</span>
          </span>
          <span className="bg-[#FF5722] text-white border border-black px-2 py-0.5">
            ANOMALIES: {analytics.anomalyCount}
          </span>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="relative flex-1 bg-[#FAF8F5] overflow-hidden min-h-[360px] border-b-3 border-black">
        {/* SVG Cluster Hull Boundaries & Edges Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Cluster Hulls / Polygons */}
          {computedClusters.map(group => {
            if (group.hullPoints.length < 3) return null;
            const pointsStr = group.hullPoints
              .map(p => `${(p.x / 850) * 100}%,${(p.y / 400) * 100}%`)
              .join(' ');

            return (
              <g key={group.id}>
                <polygon
                  points={group.hullPoints.map(p => `${(p.x / 850) * 100 * 8.5},${(p.y / 400) * 100 * 4}`).join(' ')}
                  fill={group.color}
                  fillOpacity="0.12"
                  stroke={group.color}
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              </g>
            );
          })}

          {/* Inter-node Relationship Edges */}
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
                  stroke="#000000"
                  strokeWidth={isHighlighted ? 4 : 2}
                  strokeDasharray={isHighlighted ? '6 3' : 'none'}
                />
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
                className={`absolute transition-all duration-200 transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer ${
                  isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-20'
                }`}
              >
                {/* Node Box */}
                <div className={`relative px-3.5 py-2 border-2 border-black transition-all ${
                  isSelected
                    ? 'bg-[#FFE600] text-black shadow-[4px_4px_0px_0px_#000] -translate-x-0.5 -translate-y-0.5'
                    : isNodeActive || isClusterActive
                    ? 'bg-[#FF70A6] text-black shadow-[3px_3px_0px_0px_#000]'
                    : 'bg-[#FFFFFF] text-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#CCFF00]'
                }`}>
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 border border-black ${
                      node.status === 'critical' ? 'bg-[#FF5722] animate-bounce' :
                      node.status === 'abnormal' ? 'bg-[#FF6B35]' :
                      node.status === 'warning' ? 'bg-[#FFE600]' : 'bg-[#CCFF00]'
                    }`}></span>
                    <span className="text-xs font-black font-display tracking-tight text-black">{node.label}</span>
                  </div>
                  <div className="flex items-center justify-between space-x-2 mt-1">
                    <span className="text-[9px] font-mono font-black uppercase text-black/70">{node.type}</span>
                    <span className="text-[10px] font-mono font-black text-black bg-black/10 px-1">{node.value}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend Overlay at Bottom */}
        <div className="absolute bottom-2 left-2 right-2 px-3 py-2 bg-[#FFFFFF] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex flex-wrap items-center justify-between text-[11px] font-mono font-bold text-black gap-2">
          <div className="flex items-center space-x-3">
            <span className="font-black font-display">LENS VIEW ({computedClusters.length} CLUSTERS):</span>
            <div className="flex items-center space-x-3 overflow-x-auto">
              {computedClusters.slice(0, 4).map(c => (
                <span key={c.id} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 border border-black" style={{ backgroundColor: c.color }}></span>
                  <span className="truncate max-w-[120px]">{c.title}</span>
                </span>
              ))}
            </div>
          </div>
          <span className="text-[10px] font-black uppercase bg-[#FFE600] px-1 border border-black">CLICK NODE TO INSPECT DEEP GOAL IMPACT</span>
        </div>
      </div>

      {/* Selected Node Details & Deep Goal Impact Drawer */}
      {selectedNode && (
        <div className="p-4 bg-[#FFFFFF] flex flex-wrap items-center justify-between gap-3 text-xs border-t-2 border-black">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center">
              <Info className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black font-display text-black text-sm">{selectedNode.label}</span>
                <span className="px-2 py-0.5 text-[9px] font-mono font-black uppercase bg-black text-[#FFE600] border border-black">
                  {selectedNode.clusterId.toUpperCase()} CLUSTER
                </span>
              </div>
              <p className="text-black/90 font-semibold text-[11px] mt-0.5">{selectedNode.details}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {affectedPersona && affectedPersona.deepGoals && (
              <div className="bg-[#FAF8F5] p-2 border-2 border-black shadow-[2px_2px_0px_0px_#000] max-w-xs">
                <span className="text-[9px] font-mono font-black uppercase text-black/70 flex items-center gap-1">
                  <Target className="w-3 h-3 text-[#F43F5E] stroke-[2.5]" />
                  IMPACTED PERSONA GOAL:
                </span>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="font-black font-display text-[11px]" style={{ color: affectedPersona.color }}>
                    {affectedPersona.name}
                  </span>
                  <span className="text-[10px] font-bold text-black truncate">
                    "{affectedPersona.deepGoals.primaryGoal}"
                  </span>
                </div>
              </div>
            )}

            <div className="bg-[#CCFF00] p-2 border border-black">
              <span className="text-black text-[9px] font-black uppercase block">RISK VECTOR</span>
              <span className="font-black text-black font-mono">
                {selectedNode.vector?.riskScore ? `${selectedNode.vector.riskScore} / 100` : 'EHR Verified'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
