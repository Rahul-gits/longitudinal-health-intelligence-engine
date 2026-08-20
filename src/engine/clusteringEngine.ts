import { 
  ClusterNode, 
  ClusterType, 
  ClusterLensMode, 
  ClusterAnalytics, 
  PersonaId 
} from '../types/health';
import { PERSONA_PROFILES } from '../data/mockPatientData';

export interface ComputedClusterGroup {
  id: string;
  title: string;
  color: string;
  nodeIds: string[];
  centroid: { x: number; y: number };
  hullPoints: { x: number; y: number }[];
  cohesionScore: number;
  description: string;
  associatedPersonaId?: PersonaId;
}

export class ClusteringEngine {
  /**
   * Group nodes into computed dynamic clusters based on active lens mode
   */
  public computeClusters(
    nodes: ClusterNode[],
    mode: ClusterLensMode,
    kClustersCount: number = 4
  ): ComputedClusterGroup[] {
    switch (mode) {
      case 'domain':
        return this.clusterByDomain(nodes);
      case 'goal_alignment':
        return this.clusterByGoalAlignment(nodes);
      case 'risk_severity':
        return this.clusterByRiskSeverity(nodes);
      case 'biomarker_correlation':
      default:
        return this.clusterByVectorSimilarity(nodes, kClustersCount);
    }
  }

  /**
   * Calculate global analytics for the cluster graph
   */
  public computeAnalytics(nodes: ClusterNode[], mode: ClusterLensMode): ClusterAnalytics {
    if (nodes.length === 0) {
      return { cohesionIndex: 0, silhouetteScore: 0, anomalyCount: 0, clusterCount: 0, dominantDomain: 'None' };
    }

    const clusters = this.computeClusters(nodes, mode);
    const totalCohesion = clusters.reduce((acc, c) => acc + c.cohesionScore, 0);
    const avgCohesion = clusters.length > 0 ? Number((totalCohesion / clusters.length).toFixed(1)) : 85.0;

    const criticalCount = nodes.filter(n => n.status === 'critical').length;
    const abnormalCount = nodes.filter(n => n.status === 'abnormal').length;
    const anomalyCount = criticalCount + abnormalCount;

    // Approximate Silhouette score between -1 and 1
    const silhouetteScore = Number((0.68 + (avgCohesion / 250) - (anomalyCount * 0.04)).toFixed(2));

    // Find dominant domain
    const domainCounts: Record<string, number> = {};
    nodes.forEach(n => {
      domainCounts[n.clusterId] = (domainCounts[n.clusterId] || 0) + 1;
    });
    const dominantDomain = Object.entries(domainCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'reports';

    return {
      cohesionIndex: Math.max(0, Math.min(100, avgCohesion)),
      silhouetteScore: Math.max(-1, Math.min(1, silhouetteScore)),
      anomalyCount,
      clusterCount: clusters.length,
      dominantDomain: dominantDomain.toUpperCase()
    };
  }

  // --- PRIVATE CLUSTERING STRATEGIES ---

  private clusterByDomain(nodes: ClusterNode[]): ComputedClusterGroup[] {
    const domainColors: Record<ClusterType, string> = {
      symptoms: '#FF70A6',
      history: '#3A86FF',
      reports: '#00F5D4',
      medication: '#8338EC',
      lifestyle: '#CCFF00',
      risk: '#FF6B35',
      recovery: '#FFE600'
    };

    const groupedMap = new Map<ClusterType, ClusterNode[]>();
    nodes.forEach(node => {
      const group = groupedMap.get(node.clusterId) || [];
      group.push(node);
      groupedMap.set(node.clusterId, group);
    });

    const results: ComputedClusterGroup[] = [];
    groupedMap.forEach((groupNodes, domainKey) => {
      const centroid = this.calculateCentroid(groupNodes);
      const hullPoints = this.calculateConvexHull(groupNodes);
      const cohesionScore = this.calculateCohesion(groupNodes, centroid);

      results.push({
        id: `domain-${domainKey}`,
        title: `${domainKey.toUpperCase()} CLUSTER`,
        color: domainColors[domainKey] || '#FFE600',
        nodeIds: groupNodes.map(n => n.id),
        centroid,
        hullPoints,
        cohesionScore,
        description: `Domain telemetry grouping for ${domainKey}`
      });
    });

    return results;
  }

  private clusterByGoalAlignment(nodes: ClusterNode[]): ComputedClusterGroup[] {
    const personaMap = new Map<PersonaId, ClusterNode[]>();

    nodes.forEach(node => {
      const pId = node.affectedPersonaId || node.vector?.affectedPersonaGoalId || 'clinical';
      const list = personaMap.get(pId) || [];
      list.push(node);
      personaMap.set(pId, list);
    });

    const results: ComputedClusterGroup[] = [];
    personaMap.forEach((groupNodes, pId) => {
      const profile = PERSONA_PROFILES[pId] || { name: String(pId), color: '#3B82F6', deepGoals: { primaryGoal: 'Clinical optimization' } };
      const centroid = this.calculateCentroid(groupNodes);
      const hullPoints = this.calculateConvexHull(groupNodes);
      const cohesionScore = this.calculateCohesion(groupNodes, centroid);

      results.push({
        id: `goal-${pId}`,
        title: `${profile.name.toUpperCase()} GOAL CLUSTER`,
        color: profile.color || '#3B82F6',
        nodeIds: groupNodes.map(n => n.id),
        centroid,
        hullPoints,
        cohesionScore,
        description: profile.deepGoals?.primaryGoal || 'Persona Goal Target Alignment',
        associatedPersonaId: pId
      });
    });

    return results;
  }

  private clusterByRiskSeverity(nodes: ClusterNode[]): ComputedClusterGroup[] {
    const riskGroups: Record<string, { nodes: ClusterNode[]; color: string; label: string }> = {
      critical: { nodes: [], color: '#FF5722', label: 'CRITICAL HAZARD CLUSTER' },
      warning_abnormal: { nodes: [], color: '#FF6B35', label: 'ELEVATED RISK CLUSTER' },
      normal: { nodes: [], color: '#CCFF00', label: 'NORMAL BASELINE CLUSTER' }
    };

    nodes.forEach(node => {
      if (node.status === 'critical') {
        riskGroups.critical.nodes.push(node);
      } else if (node.status === 'abnormal' || node.status === 'warning') {
        riskGroups.warning_abnormal.nodes.push(node);
      } else {
        riskGroups.normal.nodes.push(node);
      }
    });

    const results: ComputedClusterGroup[] = [];
    Object.entries(riskGroups).forEach(([key, val]) => {
      if (val.nodes.length === 0) return;

      const centroid = this.calculateCentroid(val.nodes);
      const hullPoints = this.calculateConvexHull(val.nodes);
      const cohesionScore = this.calculateCohesion(val.nodes, centroid);

      results.push({
        id: `risk-${key}`,
        title: val.label,
        color: val.color,
        nodeIds: val.nodes.map(n => n.id),
        centroid,
        hullPoints,
        cohesionScore,
        description: `Telemetry items stratified by ${key} severity score`
      });
    });

    return results;
  }

  private clusterByVectorSimilarity(nodes: ClusterNode[], k: number): ComputedClusterGroup[] {
    if (nodes.length === 0) return [];

    // Simple distance-based spatial & vector k-means clustering
    const clusterColors = ['#00F5D4', '#FF70A6', '#8338EC', '#FFE600', '#3A86FF', '#FF6B35'];
    
    // Step 1: Assign initial centroids based on spread
    const kActual = Math.min(k, nodes.length);
    let centroids = nodes.slice(0, kActual).map(n => ({ x: n.x, y: n.y }));

    let assignments: number[] = new Array(nodes.length).fill(0);

    // Run 5 iterations of K-means
    for (let iter = 0; iter < 5; iter++) {
      // Assign points to nearest centroid
      nodes.forEach((node, idx) => {
        let minDist = Infinity;
        let bestCluster = 0;
        centroids.forEach((c, cIdx) => {
          const dist = Math.hypot(node.x - c.x, node.y - c.y);
          if (dist < minDist) {
            minDist = dist;
            bestCluster = cIdx;
          }
        });
        assignments[idx] = bestCluster;
      });

      // Recalculate centroids
      centroids = centroids.map((_, cIdx) => {
        const memberNodes = nodes.filter((_, idx) => assignments[idx] === cIdx);
        return this.calculateCentroid(memberNodes);
      });
    }

    // Group into output structures
    const results: ComputedClusterGroup[] = [];
    for (let cIdx = 0; cIdx < kActual; cIdx++) {
      const groupNodes = nodes.filter((_, idx) => assignments[idx] === cIdx);
      if (groupNodes.length === 0) continue;

      const centroid = centroids[cIdx];
      const hullPoints = this.calculateConvexHull(groupNodes);
      const cohesionScore = this.calculateCohesion(groupNodes, centroid);

      results.push({
        id: `kmeans-${cIdx + 1}`,
        title: `VECTOR CLUSTER ${cIdx + 1}`,
        color: clusterColors[cIdx % clusterColors.length],
        nodeIds: groupNodes.map(n => n.id),
        centroid,
        hullPoints,
        cohesionScore,
        description: `Spatial & Telemetry vector similarity group (${groupNodes.length} nodes)`
      });
    }

    return results;
  }

  // --- HELPER MATH UTILITIES ---

  private calculateCentroid(nodes: ClusterNode[]): { x: number; y: number } {
    if (nodes.length === 0) return { x: 400, y: 200 };
    const sumX = nodes.reduce((acc, n) => acc + n.x, 0);
    const sumY = nodes.reduce((acc, n) => acc + n.y, 0);
    return {
      x: Number((sumX / nodes.length).toFixed(1)),
      y: Number((sumY / nodes.length).toFixed(1))
    };
  }

  private calculateCohesion(nodes: ClusterNode[], centroid: { x: number; y: number }): number {
    if (nodes.length <= 1) return 95;
    const avgDist = nodes.reduce((acc, n) => acc + Math.hypot(n.x - centroid.x, n.y - centroid.y), 0) / nodes.length;
    return Math.max(20, Math.min(99, Math.round(100 - avgDist * 0.25)));
  }

  /**
   * Computes expanded polygon boundary hull points around 2D node coordinates for SVG rendering
   */
  private calculateConvexHull(nodes: ClusterNode[]): { x: number; y: number }[] {
    if (nodes.length === 0) return [];
    if (nodes.length === 1) {
      const n = nodes[0];
      const pad = 40;
      return [
        { x: n.x - pad, y: n.y - pad },
        { x: n.x + pad, y: n.y - pad },
        { x: n.x + pad, y: n.y + pad },
        { x: n.x - pad, y: n.y + pad }
      ];
    }

    // Expand bounding box with padding
    const minX = Math.min(...nodes.map(n => n.x)) - 35;
    const maxX = Math.max(...nodes.map(n => n.x)) + 35;
    const minY = Math.min(...nodes.map(n => n.y)) - 30;
    const maxY = Math.max(...nodes.map(n => n.y)) + 30;

    return [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY }
    ];
  }
}

export const clusteringEngine = new ClusteringEngine();
