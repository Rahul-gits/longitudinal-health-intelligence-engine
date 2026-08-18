import { 
  SwarmParticle, 
  SwarmGlobalBest, 
  SwarmMetrics, 
  SwarmMessage, 
  PersonaId, 
  PersonaProfile,
  CrossExaminationDebate,
  CrossExamExchange
} from '../types/health';
import { PERSONA_PROFILES } from '../data/mockPatientData';

export class SwarmIntelligenceEngine {
  private particles: SwarmParticle[] = [];
  private globalBest: SwarmGlobalBest = {
    x: 82.5,
    y: 88.0,
    fitness: 94.6,
    hypothesis: 'Discontinue OTC Ibuprofen immediately; initiate topical Lidocaine/Capsaicin for analgesia; re-check eGFR & Serum K+ in 7 days; order baseline Echocardiogram.',
    confidence: 95,
    dominantPersonas: ['nephrology', 'medication', 'triage', 'genomic']
  };

  private metrics: SwarmMetrics = {
    cohesion: 88.4,
    entropy: 18.2,
    divergenceIndex: 0.12,
    iterationCount: 0,
    convergenceStatus: 'converging',
    activeParticlesCount: 0
  };

  private messages: SwarmMessage[] = [];

  // Hyperparameters
  private inertiaWeight: number = 0.72; // w
  private cognitiveWeight: number = 1.49; // c1 (Personal experience)
  private socialWeight: number = 1.49; // c2 (Swarm consensus)
  private mutationRate: number = 0.05;

  constructor() {
    this.initializeSwarm();
  }

  public initializeSwarm(query?: string): void {
    const profiles = Object.values(PERSONA_PROFILES);
    this.particles = [];
    this.messages = [];
    this.metrics.iterationCount = 0;

    // Default target cluster center around (82, 88)
    const targetX = 82;
    const targetY = 88;

    profiles.forEach((p, idx) => {
      // Offset initial positions to simulate initial multi-specialty opinion spread
      const angle = (idx / profiles.length) * 2 * Math.PI;
      const radius = 15 + Math.random() * 25;
      const initX = Math.max(10, Math.min(90, targetX + Math.cos(angle) * radius));
      const initY = Math.max(10, Math.min(90, targetY + Math.sin(angle) * radius));

      const particle: SwarmParticle = {
        id: `particle-${p.id}`,
        personaId: p.id,
        name: p.name,
        x: initX,
        y: initY,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        pBestX: initX,
        pBestY: initY,
        pBestScore: 60 + Math.random() * 20,
        currentScore: 60 + Math.random() * 20,
        hypothesis: `${p.name} Hypothesis: Initial multi-disciplinary opinion on patient presentation.`,
        beliefWeight: 0.8 + Math.random() * 0.4,
        confidence: Math.round(65 + Math.random() * 25),
        color: p.color,
        specialization: p.roleTitle
      };

      this.particles.push(particle);
    });

    this.metrics.activeParticlesCount = this.particles.length;
    this.updateSwarmMetrics();
    this.generateInitialMessages(query);
  }

  public stepIteration(): { particles: SwarmParticle[]; globalBest: SwarmGlobalBest; metrics: SwarmMetrics; newMessages: SwarmMessage[] } {
    this.metrics.iterationCount += 1;
    const newMessages: SwarmMessage[] = [];
    const timestamp = new Date().toLocaleTimeString();

    // 1. Update Particles using Particle Swarm Optimization (PSO) velocity & position formulas
    this.particles.forEach((p) => {
      const r1 = Math.random();
      const r2 = Math.random();

      // Cognitive velocity component (towards personal best)
      const cogX = this.cognitiveWeight * r1 * (p.pBestX - p.x);
      const cogY = this.cognitiveWeight * r1 * (p.pBestY - p.y);

      // Social velocity component (towards global best consensus)
      const socX = this.socialWeight * r2 * (this.globalBest.x - p.x);
      const socY = this.socialWeight * r2 * (this.globalBest.y - p.y);

      // Update velocities
      p.vx = this.inertiaWeight * p.vx + cogX + socX;
      p.vy = this.inertiaWeight * p.vy + cogY + socY;

      // Apply velocity clamping to prevent explosive movement
      const maxVel = 8.0;
      p.vx = Math.max(-maxVel, Math.min(maxVel, p.vx));
      p.vy = Math.max(-maxVel, Math.min(maxVel, p.vy));

      // Optional mutation / perturbation factor
      if (Math.random() < this.mutationRate) {
        p.vx += (Math.random() - 0.5) * 3;
        p.vy += (Math.random() - 0.5) * 3;
      }

      // Update positions
      p.x = Math.max(5, Math.min(95, p.x + p.vx));
      p.y = Math.max(5, Math.min(95, p.y + p.vy));

      // Calculate fitness score based on proximity to clinical target & belief weight
      const distToGbest = Math.hypot(p.x - this.globalBest.x, p.y - this.globalBest.y);
      p.currentScore = Math.max(0, Math.min(100, 100 - distToGbest * 1.2 + p.beliefWeight * 5));
      p.confidence = Math.min(99, Math.round(70 + (100 - distToGbest) * 0.3));

      // Update personal best
      if (p.currentScore > p.pBestScore) {
        p.pBestScore = p.currentScore;
        p.pBestX = p.x;
        p.pBestY = p.y;
      }

      // Inter-agent signal generation at key steps
      if (distToGbest < 8 && Math.random() < 0.25) {
        const msg: SwarmMessage = {
          id: `msg-${Date.now()}-${p.personaId}`,
          senderId: p.personaId,
          senderName: p.name,
          receiverId: 'all',
          timestamp,
          topic: 'High Convergence Consensus Signal',
          signalContent: `${p.name} aligned with Global Consensus g_best (${p.x.toFixed(1)}, ${p.y.toFixed(1)}) with ${p.confidence}% confidence!`,
          weight: Number(p.beliefWeight.toFixed(2)),
          type: 'consensus_signal'
        };
        newMessages.push(msg);
      }
    });

    // 2. Update Global Best if any particle exceeded current g_best fitness
    const bestParticle = [...this.particles].sort((a, b) => b.currentScore - a.currentScore)[0];
    if (bestParticle && bestParticle.currentScore > this.globalBest.fitness) {
      this.globalBest.x = Number((this.globalBest.x * 0.7 + bestParticle.x * 0.3).toFixed(1));
      this.globalBest.y = Number((this.globalBest.y * 0.7 + bestParticle.y * 0.3).toFixed(1));
      this.globalBest.fitness = Number(bestParticle.currentScore.toFixed(1));
      this.globalBest.confidence = Math.min(99, Math.round(this.globalBest.fitness));
    }

    // 3. Re-calculate Swarm Metrics
    this.updateSwarmMetrics();

    // 4. Store messages
    this.messages = [...newMessages, ...this.messages].slice(0, 50);

    return {
      particles: this.particles,
      globalBest: this.globalBest,
      metrics: this.metrics,
      newMessages
    };
  }

  public triggerStressTestPerturbation(): void {
    // Perturb 40% of particles to simulate an unexpected acute symptom flare (e.g. sudden hyperkalemia or chest tightness)
    this.particles.forEach(p => {
      if (Math.random() < 0.4) {
        p.x = Math.max(5, Math.min(95, p.x + (Math.random() - 0.5) * 35));
        p.y = Math.max(5, Math.min(95, p.y + (Math.random() - 0.5) * 35));
        p.vx = (Math.random() - 0.5) * 10;
        p.vy = (Math.random() - 0.5) * 10;
      }
    });

    const msg: SwarmMessage = {
      id: `msg-stress-${Date.now()}`,
      senderId: 'triage',
      senderName: 'Triage AI',
      receiverId: 'all',
      timestamp: new Date().toLocaleTimeString(),
      topic: 'STRESS TEST: Acute Perturbation Injected',
      signalContent: 'ALERT: Simulated acute symptom flare injected into swarm space! Micro-agents recalculating velocity trajectories.',
      weight: 1.0,
      type: 'critique'
    };

    this.messages.unshift(msg);
    this.updateSwarmMetrics();
  }

  public setParameters(inertia: number, c1: number, c2: number, mutationRate: number): void {
    this.inertiaWeight = inertia;
    this.cognitiveWeight = c1;
    this.socialWeight = c2;
    this.mutationRate = mutationRate;
  }

  public getParameters() {
    return {
      inertia: this.inertiaWeight,
      c1: this.cognitiveWeight,
      c2: this.socialWeight,
      mutationRate: this.mutationRate
    };
  }

  public addCustomPersona(persona: PersonaProfile): SwarmParticle {
    const initX = 30 + Math.random() * 40;
    const initY = 30 + Math.random() * 40;

    const newParticle: SwarmParticle = {
      id: `particle-${persona.id}-${Date.now()}`,
      personaId: persona.id,
      name: persona.name,
      x: initX,
      y: initY,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5,
      pBestX: initX,
      pBestY: initY,
      pBestScore: 70,
      currentScore: 70,
      hypothesis: `Custom ${persona.name} perspective on patient telemetry.`,
      beliefWeight: 1.0,
      confidence: 85,
      color: persona.color || '#3B82F6',
      specialization: persona.roleTitle || 'Custom Specialist'
    };

    this.particles.push(newParticle);
    this.metrics.activeParticlesCount = this.particles.length;
    this.updateSwarmMetrics();

    const msg: SwarmMessage = {
      id: `msg-add-${Date.now()}`,
      senderId: persona.id,
      senderName: persona.name,
      receiverId: 'all',
      timestamp: new Date().toLocaleTimeString(),
      topic: 'New Persona Agent Joined Swarm',
      signalContent: `Custom Persona "${persona.name}" injected into multi-agent space.`,
      weight: 0.9,
      type: 'proposal'
    };
    this.messages.unshift(msg);

    return newParticle;
  }

  public generateCrossExamination(personaAId: PersonaId, personaBId: PersonaId, topic?: string): CrossExaminationDebate {
    const personaA = PERSONA_PROFILES[personaAId] || { name: String(personaAId), roleTitle: 'Specialist AI' };
    const personaB = PERSONA_PROFILES[personaBId] || { name: String(personaBId), roleTitle: 'Specialist AI' };

    const debateTopic = topic || 'NSAID Cessation vs Pain Management & Renal Protection';

    const exchanges: CrossExamExchange[] = [
      {
        personaId: personaAId,
        personaName: personaA.name,
        argument: `As ${personaA.name} (${personaA.roleTitle}), I stress that continuing OTC Ibuprofen in a Stage 2 CKD patient with active ACEi therapy creates unacceptable renal risk (eGFR dropped from 64 to 52). We must prioritize hemodynamics.`,
        evidenceRef: 'KDIGO 2024 Guidelines & FDA Blackbox Warnings on NSAIDs in Kidney Disease',
        tensionScore: 45
      },
      {
        personaId: personaBId,
        personaName: personaB.name,
        argument: `From ${personaB.name}'s stance (${personaB.roleTitle}), simply withdrawing analgesia without a valid substitute leads to patient distress, non-compliance, and functional decline (daily steps already dropped 40%). We need a functional alternative.`,
        evidenceRef: 'CPIC Guidelines & AMA Shared Decision Protocols',
        tensionScore: 68,
        counterToId: personaAId
      },
      {
        personaId: personaAId,
        personaName: personaA.name,
        argument: `Agreed on functional preservation. However, systemic non-selective NSAIDs inhibit both COX-1 and COX-2 in renal tissue. I propose substituting topical Capsaicin or Lidocaine 5% patches which provide localized analgesic relief without systemic renal clearance burden.`,
        evidenceRef: 'Pharmacotherapy 2024: Topical Analgesic Safety in Moderate-to-Severe CKD',
        tensionScore: 25
      },
      {
        personaId: personaBId,
        personaName: personaB.name,
        argument: `That resolves the friction! Topical Lidocaine provides targeted knee analgesia with negligible plasma absorption (<3%), safeguarding both eGFR stability and Eleanor's daily mobility.`,
        evidenceRef: 'OARSI Clinical Practice Guidelines for Osteoarthritis',
        tensionScore: 10
      }
    ];

    return {
      id: `cross-exam-${Date.now()}`,
      topic: debateTopic,
      personaA: personaAId,
      personaB: personaBId,
      exchanges,
      consensusVerdict: `Unified Resolution: Discontinue oral NSAID; initiate topical 5% Lidocaine patch PRN for knee pain; order 7-day renal panel follow-up.`,
      agreementPercentage: 94
    };
  }

  public getParticles(): SwarmParticle[] {
    return this.particles;
  }

  public getGlobalBest(): SwarmGlobalBest {
    return this.globalBest;
  }

  public getMetrics(): SwarmMetrics {
    return this.metrics;
  }

  public getMessages(): SwarmMessage[] {
    return this.messages;
  }

  private updateSwarmMetrics(): void {
    if (this.particles.length === 0) return;

    // Calculate centroid (avg X, avg Y)
    const avgX = this.particles.reduce((acc, p) => acc + p.x, 0) / this.particles.length;
    const avgY = this.particles.reduce((acc, p) => acc + p.y, 0) / this.particles.length;

    // Calculate mean distance to centroid (cohesion metric)
    const meanDist = this.particles.reduce((acc, p) => acc + Math.hypot(p.x - avgX, p.y - avgY), 0) / this.particles.length;
    const maxPossibleDist = 70; // rough canvas diagonal range
    const cohesion = Math.max(0, Math.min(100, 100 - (meanDist / maxPossibleDist) * 100));

    // Calculate entropy (spread variance)
    const variance = this.particles.reduce((acc, p) => acc + Math.pow(p.x - avgX, 2) + Math.pow(p.y - avgY, 2), 0) / this.particles.length;
    const entropy = Math.min(100, Math.sqrt(variance) * 2.5);

    // Calculate divergence index (standard deviation of scores)
    const avgScore = this.particles.reduce((acc, p) => acc + p.currentScore, 0) / this.particles.length;
    const scoreVar = this.particles.reduce((acc, p) => acc + Math.pow(p.currentScore - avgScore, 2), 0) / this.particles.length;
    const divergenceIndex = Number((Math.sqrt(scoreVar) / 100).toFixed(2));

    // Status classification
    let status: SwarmMetrics['convergenceStatus'] = 'exploring';
    if (cohesion > 85) {
      status = 'hyper_converged';
    } else if (cohesion > 55) {
      status = 'converging';
    } else if (divergenceIndex > 0.35) {
      status = 'disputed';
    }

    this.metrics = {
      cohesion: Number(cohesion.toFixed(1)),
      entropy: Number(entropy.toFixed(1)),
      divergenceIndex,
      iterationCount: this.metrics.iterationCount,
      convergenceStatus: status,
      activeParticlesCount: this.particles.length
    };
  }

  private generateInitialMessages(query?: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.messages = [
      {
        id: 'msg-init-1',
        senderId: 'swarm_orchestrator',
        senderName: 'Swarm Coordinator',
        receiverId: 'all',
        timestamp,
        topic: 'Swarm Intelligence Engine Initialized',
        signalContent: query ? `Evaluating custom query: "${query}" across 13 specialized persona nodes.` : 'Multi-Agent Swarm initialized across 13 clinical micro-agent particles.',
        weight: 1.0,
        type: 'proposal'
      },
      {
        id: 'msg-init-2',
        senderId: 'nephrology',
        senderName: 'Nephrology AI',
        receiverId: 'medication',
        timestamp,
        topic: 'eGFR Telemetry Flag',
        signalContent: 'Flagging 18.7% drop in eGFR (64 -> 52). Requesting drug clearance safety check from Medication AI.',
        weight: 0.95,
        type: 'critique'
      },
      {
        id: 'msg-init-3',
        senderId: 'genomic',
        senderName: 'Genomics AI',
        receiverId: 'nephrology',
        timestamp,
        topic: 'CYP2C9 Variant Exposure',
        signalContent: 'Patient carries CYP2C9*3 allele. Prolonged NSAID systemic half-life exacerbates renal arteriolar constriction.',
        weight: 0.88,
        type: 'validation'
      }
    ];
  }
}
